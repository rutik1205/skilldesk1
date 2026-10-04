import React from 'react';
import {
  Clock,
  IndianRupee,
  Users,
  CheckCircle,
  GitBranch,
} from 'lucide-react';

export default function ProjectCard({ project, onClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-open">Open for Bids</span>;
      case 'in_progress':
        return <span className="badge badge-in_progress">In Progress</span>;
      case 'submitted':
        return <span className="badge badge-submitted">GitHub Submitted</span>;
      case 'completed':
        return <span className="badge badge-completed"><CheckCircle size={12} /> Completed</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Indian Rupee formatting
  const formattedBudget = Number(project.budget || 0).toLocaleString('en-IN');

  return (
    <div className="project-card" onClick={onClick}>
      <div>
        {/* Card Top: Category & Status */}
        <div className="card-top">
          <span className="card-category">{project.category}</span>
          {getStatusBadge(project.status)}
        </div>

        {/* Project Title */}
        <h3 className="card-title">{project.title}</h3>

        {/* Project Description Snippet */}
        <p className="card-desc">{project.description}</p>

        {/* GitHub Delivery Indicator if available */}
        {project.submission?.githubUrl && (
          <div className="card-github-pill">
            <GitBranch size={13} color="#24292f" />
            <span>GitHub Delivery Linked</span>
          </div>
        )}

        {/* Skills Required */}
        <div className="card-skills">
          {project.skillsRequired?.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="skill-tag">
              {skill}
            </span>
          ))}
          {project.skillsRequired?.length > 4 && (
            <span className="skill-tag" style={{ color: '#64748b' }}>
              +{project.skillsRequired.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: INR Budget & Proposal count */}
      <div className="card-footer">
        <div className="card-budget">
          <span className="budget-amount">₹{formattedBudget}</span>
          <span className="budget-type">{project.budgetType} Price (INR)</span>
        </div>

        <div className="card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={14} />
            {project.bidCount || 0} {project.bidCount === 1 ? 'proposal' : 'proposals'}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} />
            {timeAgo(project.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
