const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects with filtering, search, and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, minBudget, maxBudget, status, sort, limit = 20, page = 1 } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      // By default show open and in_progress if not explicitly specified
      filter.status = { $in: ['open', 'in_progress', 'submitted', 'completed'] };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'budget_high') sortOption = { budget: -1 };
    if (sort === 'budget_low') sortOption = { budget: 1 };
    if (sort === 'bids') sortOption = { bidCount: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('client', 'name avatar headline ratingsAverage')
      .populate('selectedFreelancer', 'name avatar headline githubUrl')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      projects,
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching projects' });
  }
});

// @route   GET /api/projects/my/client
// @desc    Get all projects posted by logged-in client
router.get('/my/client', protect, async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate('selectedFreelancer', 'name avatar headline githubUrl')
      .populate('selectedBid')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving your projects' });
  }
});

// @route   GET /api/projects/my/freelancer
// @desc    Get all projects assigned to or won by logged-in freelancer
router.get('/my/freelancer', protect, async (req, res) => {
  try {
    const projects = await Project.find({ selectedFreelancer: req.user._id })
      .populate('client', 'name avatar headline')
      .populate('selectedBid')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving awarded projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar headline ratingsAverage postedProjectsCount createdAt')
      .populate('selectedFreelancer', 'name avatar headline githubUrl ratingsAverage')
      .populate('selectedBid');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving project details' });
  }
});

// @route   GET /api/projects/:id/bids
// @desc    Get all proposals/bids for this project
router.get('/:id/bids', optionalAuth, async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.id })
      .populate('freelancer', 'name email avatar headline bio skills hourlyRate ratingsAverage ratingsCount completedProjectsCount githubUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving proposals' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project (Client)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, budget, budgetType, deadline, skillsRequired, attachments } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and budget' });
    }

    const skills = Array.isArray(skillsRequired)
      ? skillsRequired
      : (skillsRequired || '').split(',').map((s) => s.trim()).filter(Boolean);

    const project = await Project.create({
      title,
      description,
      category: category || 'Full Stack Development',
      budget: Number(budget),
      budgetType: budgetType || 'fixed',
      deadline: deadline || null,
      skillsRequired: skills,
      attachments: attachments || [],
      client: req.user._id,
      status: 'open',
    });

    // Update user posted projects count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postedProjectsCount: 1 } });

    const populatedProject = await Project.findById(project._id).populate('client', 'name avatar headline');

    res.status(201).json({
      success: true,
      project: populatedProject,
      message: 'Project posted successfully!',
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error posting project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
router.put('/:id', protect, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only project client can edit
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const { title, description, category, budget, budgetType, deadline, skillsRequired, attachments, status } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (budget) project.budget = Number(budget);
    if (budgetType) project.budgetType = budgetType;
    if (deadline !== undefined) project.deadline = deadline;
    if (status && ['open', 'cancelled'].includes(status)) project.status = status;
    if (skillsRequired) {
      project.skillsRequired = Array.isArray(skillsRequired)
        ? skillsRequired
        : skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (attachments) project.attachments = attachments;

    await project.save();

    res.json({
      success: true,
      project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    // Clean up bids associated with this project
    await Bid.deleteMany({ project: project._id });
    await project.deleteOne();

    await User.findByIdAndUpdate(req.user._id, { $inc: { postedProjectsCount: -1 } });

    res.json({
      success: true,
      message: 'Project and associated proposals removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
});

// @route   POST /api/projects/:id/hire/:bidId
// @desc    Client accepts a proposal / hires a freelancer
router.post('/:id/hire/:bidId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only project owner can hire
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can hire a freelancer' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This project is already awarded or completed' });
    }

    const bid = await Bid.findById(req.params.bidId);
    if (!bid || bid.project.toString() !== project._id.toString()) {
      return res.status(404).json({ success: false, message: 'Proposal not found for this project' });
    }

    // Accept selected bid
    bid.status = 'accepted';
    await bid.save();

    // Reject other bids for this project
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // Update project state
    project.selectedFreelancer = bid.freelancer;
    project.selectedBid = bid._id;
    project.status = 'in_progress';
    project.awardedAt = new Date();
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('client', 'name avatar')
      .populate('selectedFreelancer', 'name avatar headline githubUrl')
      .populate('selectedBid');

    res.json({
      success: true,
      project: updatedProject,
      message: 'Freelancer successfully hired! Project is now In Progress.',
    });
  } catch (error) {
    console.error('Hire error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error hiring freelancer' });
  }
});

// @route   POST /api/projects/:id/submit-work
// @desc    Freelancer submits project deliverable via GitHub Link
router.post('/:id/submit-work', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only awarded freelancer can submit work
    if (!project.selectedFreelancer || project.selectedFreelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the assigned freelancer can submit work for this project' });
    }

    const { githubUrl, liveDemoUrl, notes, attachments } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ success: false, message: 'GitHub repository URL is required for project delivery' });
    }

    // Basic GitHub link format check
    if (!githubUrl.toLowerCase().includes('github.com')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid GitHub repository link (e.g. https://github.com/username/repo)' });
    }

    project.submission = {
      githubUrl: githubUrl.trim(),
      liveDemoUrl: (liveDemoUrl || '').trim(),
      notes: notes || '',
      submittedAt: new Date(),
      attachments: attachments || [],
    };
    project.status = 'submitted';

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('client', 'name avatar')
      .populate('selectedFreelancer', 'name avatar headline githubUrl');

    res.json({
      success: true,
      project: updatedProject,
      message: 'Work successfully submitted with GitHub link! Client will review your deliverable.',
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error submitting project deliverable' });
  }
});

// @route   POST /api/projects/:id/approve
// @desc    Client approves GitHub deliverable & completes project with review
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can approve deliverables' });
    }

    const { rating = 5, feedback = 'Great work on the GitHub deliverable! Thoroughly satisfied.' } = req.body;

    project.status = 'completed';
    project.review = {
      rating: Number(rating),
      feedback,
      reviewedAt: new Date(),
    };
    await project.save();

    // Update freelancer's statistics & rating
    if (project.selectedFreelancer) {
      const freelancer = await User.findById(project.selectedFreelancer);
      if (freelancer) {
        const currentTotal = freelancer.ratingsAverage * freelancer.ratingsCount;
        const newCount = freelancer.ratingsCount + 1;
        const newAverage = Number(((currentTotal + Number(rating)) / newCount).toFixed(1));

        freelancer.ratingsCount = newCount;
        freelancer.ratingsAverage = newAverage;
        freelancer.completedProjectsCount += 1;
        await freelancer.save();
      }
    }

    const updatedProject = await Project.findById(project._id)
      .populate('client', 'name avatar')
      .populate('selectedFreelancer', 'name avatar headline');

    res.json({
      success: true,
      project: updatedProject,
      message: 'Project approved and completed! Rating submitted to freelancer.',
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error approving project' });
  }
});

// @route   POST /api/projects/:id/request-revision
// @desc    Client requests revisions on submitted GitHub repo
router.post('/:id/request-revision', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can request revisions' });
    }

    const { revisionNotes } = req.body;
    project.status = 'in_progress';
    if (project.submission) {
      project.submission.notes = (project.submission.notes ? project.submission.notes + '\n\n' : '') +
        `[Revision Requested]: ${revisionNotes || 'Please adjust the code and resubmit.'}`;
    }

    await project.save();

    res.json({
      success: true,
      project,
      message: 'Revision requested. Status reverted to In Progress for freelancer to update.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error requesting revision' });
  }
});

module.exports = router;
