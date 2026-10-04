const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Project = require('../models/Project');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/messages/project/:projectId
// @desc    Get all chat & negotiation messages for a project
router.get(['/project/:projectId', '/:projectId'], optionalAuth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'name avatar role headline email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving messages' });
  }
});

// @route   POST /api/messages/project/:projectId
// @desc    Send a message or negotiation note
router.post(['/project/:projectId', '/:projectId'], protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text, attachment, isNegotiation, proposedAmount } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      text: text.trim(),
      attachment: attachment || { url: '', name: '' },
      isNegotiation: Boolean(isNegotiation),
      proposedAmount: proposedAmount ? Number(proposedAmount) : null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar role headline email');

    // Real-time broadcast via Socket.IO if connected
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('newMessage', populated);
    }

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error sending message' });
  }
});

module.exports = router;
