import React from 'react';
import { X, PlusCircle, Users, CheckCircle2, GitBranch, Star, ShieldCheck } from 'lucide-react';

export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Post a Project',
      desc: 'Clients post project details, tech stack requirements, budget, and attach specs/designs using ImageKit.',
      icon: <PlusCircle size={22} color="#4f46e5" />,
    },
    {
      num: '2',
      title: 'Receive Developer Proposals',
      desc: 'Top freelancers review requirements and submit competitive bids with price, timeline, and GitHub portfolios.',
      icon: <Users size={22} color="#0284c7" />,
    },
    {
      num: '3',
      title: 'Choose & Hire a Freelancer',
      desc: 'Client selects the best candidate with one click. The project enters In Progress and work begins.',
      icon: <CheckCircle2 size={22} color="#059669" />,
    },
    {
      num: '4',
      title: 'Deliver via GitHub Repository',
      desc: 'The developer submits their finished code as a GitHub repository link, along with documentation and demo links.',
      icon: <GitBranch size={22} color="#0f172a" />,
    },
    {
      num: '5',
      title: 'Client Review & Approval',
      desc: 'Client reviews the GitHub repository and marks the project complete with a star rating and testimonial.',
      icon: <Star size={22} color="#f59e0b" />,
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>How SkillDesk Works</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              A transparent, GitHub-first marketplace for modern software development.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {step.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    STEP {step.num}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{step.title}</h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
}
