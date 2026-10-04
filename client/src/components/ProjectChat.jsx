import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  IndianRupee,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import ImageKitUpload from './ImageKitUpload';

export default function ProjectChat({ projectId, projectTitle, projectClient, onOpenAuth }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [proposedAmount, setProposedAmount] = useState('');
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch messages from REST API
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/project/${projectId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Socket.io connection & real-time listening
  useEffect(() => {
    fetchMessages();

    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('joinProject', projectId);

    socket.on('newMessage', (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already appended
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Background polling fallback every 5s
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      clearInterval(interval);
      socket.emit('leaveProject', projectId);
      socket.disconnect();
    };
  }, [projectId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!inputText.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/messages/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: inputText.trim(),
          attachment: attachment ? { url: attachment.url, name: attachment.name } : undefined,
          isNegotiation: isNegotiating,
          proposedAmount: isNegotiating && proposedAmount ? Number(proposedAmount) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Optimistic append
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });

      setInputText('');
      setAttachment(null);
      setShowAttachmentUploader(false);
      setIsNegotiating(false);
      setProposedAmount('');
    } catch (err) {
      setError(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'Can we discuss the budget and timeline?',
    'What are the core technical milestones?',
    'I pushed new commits to the GitHub repository. Please review!',
    'Could you clarify the database schema requirements?',
  ];

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Project Discussion & Negotiation
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Discuss requirements, negotiate terms in INR, or troubleshoot issues
            </span>
          </div>
        </div>

        <span className="badge badge-open" style={{ fontSize: '0.72rem' }}>
          ● Live Chat
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
            }}
          >
            <MessageSquare size={36} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No messages yet</h4>
            <p style={{ fontSize: '0.82rem', maxWidth: '380px', marginTop: '0.25rem' }}>
              Start the discussion! Ask questions about requirements, negotiate the budget, or coordinate GitHub deliverables.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && String(msg.sender?._id || msg.sender) === String(user._id);

            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {isMe ? 'You' : msg.sender?.name || 'User'}
                  </span>
                  <span
                    className={`badge ${msg.sender?.role === 'client' ? 'badge-primary' : 'badge-neutral'}`}
                    style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}
                  >
                    {msg.sender?.role || 'member'}
                  </span>
                  <span>{formatTime(msg.createdAt)}</span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    borderTopRightRadius: isMe ? '2px' : 'var(--radius-lg)',
                    borderTopLeftRadius: !isMe ? '2px' : 'var(--radius-lg)',
                    background: isMe ? 'var(--primary)' : '#f8fafc',
                    color: isMe ? '#ffffff' : '#0f172a',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    boxShadow: isMe ? '0 2px 6px rgba(79, 70, 229, 0.2)' : 'var(--shadow-xs)',
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {/* If this is a price negotiation message */}
                  {msg.isNegotiation && msg.proposedAmount && (
                    <div
                      style={{
                        background: isMe ? 'rgba(255, 255, 255, 0.18)' : '#ecfdf5',
                        border: isMe ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #a7f3d0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.65rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isMe ? '#ffffff' : '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <IndianRupee size={14} />
                      <span>Negotiated Counter-Offer: ₹{Number(msg.proposedAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                  {/* Attachment if present */}
                  {msg.attachment?.url && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <a
                        href={msg.attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isMe ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
                          color: isMe ? '#ffffff' : 'var(--primary)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        <Paperclip size={13} />
                        <span>{msg.attachment.name || 'View Attachment (ImageKit)'}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          padding: '0.6rem 0',
          borderTop: '1px solid #f1f5f9',
          scrollbarWidth: 'none',
        }}
      >
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="skill-tag"
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: '#f8fafc',
              fontSize: '0.74rem',
            }}
            onClick={() => setInputText(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Negotiation Toggle / Amount Bar */}
      {isNegotiating && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#065f46' }}>
            <IndianRupee size={15} />
            <span>Counter-Offer (₹ INR):</span>
          </div>
          <input
            type="number"
            min={100}
            placeholder="e.g. 18000"
            className="form-input"
            style={{ width: '140px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
            value={proposedAmount}
            onChange={(e) => setProposedAmount(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsNegotiating(false)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#065f46',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel Offer
          </button>
        </div>
      )}

      {/* Optional ImageKit Attachment Area */}
      {showAttachmentUploader && (
        <div style={{ marginBottom: '0.5rem' }}>
          <ImageKitUpload
            label="Attach File / Screenshot (ImageKit CDN)"
            folder="/skilldesk/chat"
            onUploadSuccess={(url, fileData) => setAttachment(fileData)}
          />
        </div>
      )}

      {error && (
        <div style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          title="Attach Image or Document via ImageKit"
          onClick={() => setShowAttachmentUploader(!showAttachmentUploader)}
          className="btn btn-secondary btn-icon"
          style={{ width: '40px', height: '40px', flexShrink: 0 }}
        >
          <Paperclip size={18} color="#64748b" />
        </button>

        <button
          type="button"
          title="Propose Price Counter-Offer (INR)"
          onClick={() => setIsNegotiating(!isNegotiating)}
          className={`btn ${isNegotiating ? 'btn-success' : 'btn-secondary'} btn-sm`}
          style={{ flexShrink: 0, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
        >
          <IndianRupee size={14} /> Negotiate
        </button>

        <input
          type="text"
          placeholder={user ? "Type a message, ask a question, or discuss terms..." : "Sign in to send a message..."}
          disabled={!user}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />

        <button
          type="submit"
          className="btn btn-primary btn-icon"
          disabled={sending || !inputText.trim() || !user}
          style={{ width: '40px', height: '40px', flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
