import React, { useState } from 'react';
import { X, User, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageKitUpload from './ImageKitUpload';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [role, setRole] = useState(user?.role || 'client');
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate?.toString() || '1500');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [skillsString, setSkillsString] = useState(user?.skills?.join(', ') || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setBio(user.bio || '');
      setRole(user.role || 'client');
      setHourlyRate(user.hourlyRate?.toString() || '1500');
      setGithubUrl(user.githubUrl || '');
      setSkillsString(user.skills?.join(', ') || '');
      setAvatar(user.avatar || '');
    } else {
      setName('');
      setHeadline('');
      setBio('');
      setRole('client');
      setHourlyRate('1500');
      setGithubUrl('');
      setSkillsString('');
      setAvatar('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const skillsArray = skillsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        role,
        hourlyRate: Number(hourlyRate),
        githubUrl: githubUrl.trim(),
        skills: skillsArray,
        avatar,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '2.25rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Profile & Role Settings</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage your personal info, account role, and ImageKit avatar.
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

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--danger)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              color: 'var(--success)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
            }}
          >
            <CheckCircle2 size={15} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload via ImageKit */}
          <div style={{ marginBottom: '1.25rem' }}>
            <ImageKitUpload
              label="Profile Photo / Avatar (ImageKit CDN)"
              folder="/skilldesk/avatars"
              currentUrl={avatar}
              onUploadSuccess={(url) => setAvatar(url)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="client">Client (Hire & Post Projects)</option>
                <option value="freelancer">Freelancer (Bid & Deliver Code)</option>
                <option value="both">Both (Client & Developer)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              placeholder="e.g. Senior Full-Stack MERN Architect"
              className="form-input"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                placeholder="https://github.com/your-username"
                className="form-input"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate (₹/hr)</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: '#64748b',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min={100}
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="React, Node.js, Express, MongoDB, TypeScript..."
              className="form-input"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Profile Summary</label>
            <textarea
              rows={3}
              placeholder="Brief summary of your professional background and strengths..."
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
