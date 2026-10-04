import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ImageKitUpload({
  label = 'Upload Image or File via ImageKit',
  folder = '/skilldesk',
  onUploadSuccess,
  currentUrl = '',
  accept = 'image/*,application/pdf',
}) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ImageKit upload failed');
      }

      setPreviewUrl(data.url);
      if (onUploadSuccess) {
        onUploadSuccess(data.url, data);
      }
    } catch (err) {
      console.error('ImageKit upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUploadSuccess) onUploadSuccess('', null);
  };

  return (
    <div className="imagekit-uploader-container">
      {label && <label className="form-label">{label}</label>}

      {previewUrl ? (
        <div className="imagekit-preview-box" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
        }}>
          {previewUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || previewUrl.includes('ik.imagekit.io') ? (
            <img
              src={previewUrl}
              alt="Uploaded file"
              style={{
                width: '52px',
                height: '52px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
              }}
            />
          ) : (
            <div style={{
              width: '52px',
              height: '52px',
              background: '#e2e8f0',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ImageIcon size={24} color="#64748b" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                Uploaded to ImageKit CDN
              </span>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary)',
                textDecoration: 'underline',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {previewUrl}
            </a>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: '#fee2e2',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#dc2626',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <div
          className="imagekit-dropzone"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={28} className="animate-spin" color="var(--primary)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)' }}>
                Uploading to ImageKit CDN...
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UploadCloud size={22} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Click to upload file or image
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by ImageKit CDN • Images, PDF or Zip up to 10MB
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', color: '#dc2626', fontSize: '0.8rem' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
