import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import {
  Users,
  Search,
  Star,
  GitBranch,
  ExternalLink,
  IndianRupee,
  CheckCircle,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FreelancersDirectory({ onOpenAuth }) {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const skillsList = ['All', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'Docker', 'UI/UX Design'];

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      let url = '/api/auth/freelancers';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkill && selectedSkill !== 'All') params.append('skill', selectedSkill);

      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(apiUrl(url));
      const data = await res.json();
      if (data.success) {
        setFreelancers(data.freelancers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [selectedSkill]);

  return (
    <div className="container" style={{ padding: '2.5rem 0 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Discover Vetted <span className="text-gradient">Developers</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
          Hire senior MERN stack engineers, frontend specialists, and backend developers ready to deliver on GitHub.
        </p>
      </div>

      {/* Search & Skills Filter */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchFreelancers();
          }}
          style={{
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.85rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search developers by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              paddingLeft: '0.65rem',
              fontSize: '0.92rem',
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.2rem 0' }}>
          {skillsList.map((skill) => (
            <button
              key={skill}
              className={`category-pill ${
                (selectedSkill === skill || (skill === 'All' && !selectedSkill)) ? 'active' : ''
              }`}
              onClick={() => setSelectedSkill(skill === 'All' ? '' : skill)}
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Beautiful Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading developer directory...
        </div>
      ) : freelancers.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            margin: '1.5rem 0',
          }}
        >
          <Users size={44} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            No Developers Registered Yet
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '440px' }}>
            Be the first developer to register a profile on SkillDesk, showcase your GitHub portfolio, and bid on upcoming projects!
          </p>
          {!user && (
            <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
              <UserPlus size={16} /> Register as Freelancer
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {freelancers.map((dev) => (
            <div
              key={dev._id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-normal)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={
                      dev.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dev.name)}`
                    }
                    alt={dev.name}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-border)',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {dev.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {dev.headline || 'Full Stack Engineer'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                          {dev.ratingsAverage?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ({dev.ratingsCount || 0} reviews • {dev.completedProjectsCount || 0} completed)
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {dev.bio || 'Experienced developer specialized in building modern web applications.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
                  {dev.skills?.map((s, i) => (
                    <span key={i} className="skill-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{Number(dev.hourlyRate || 1200).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / hour</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {dev.githubUrl && (
                    <a
                      href={dev.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-github btn-sm"
                      title="GitHub Profile"
                    >
                      <GitBranch size={14} /> GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
