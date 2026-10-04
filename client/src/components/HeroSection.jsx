import React from 'react';
import { Search, Sparkles, GitPullRequest, ShieldCheck, Zap } from 'lucide-react';

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSearchSubmit,
}) {
  const categories = [
    'All',
    'Full Stack Development',
    'Web Frontend',
    'Backend & APIs',
    'Mobile App Development',
    'DevOps & Cloud',
    'UI/UX Design',
    'AI & Machine Learning',
  ];

  return (
    <section className="hero-section">
      <div className="container">
        {/* Pill Badge */}
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>The Developer Marketplace Built for GitHub Deliverables</span>
        </div>

        {/* Hero Headline */}
        <h1 className="hero-title">
          Post Projects. Hire Top Talent. <br />
          Deliver with <span className="text-gradient">Verified GitHub Repos</span>.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Connect with world-class engineers. Clients post requirements and review proposals.
          Award your favorite developer and receive completed deliverables directly as a clean GitHub repository.
        </p>

        {/* Search Bar */}
        <form
          className="hero-search-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit) onSearchSubmit();
          }}
        >
          <div className="search-input-wrapper">
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by skill, title (e.g. React, Node.js, Stripe, Docker)..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="search-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Quick Trust Metrics */}
        <div className="hero-metrics">
          <div className="metric-item">
            <span className="metric-value">100%</span>
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GitPullRequest size={13} color="#4f46e5" /> GitHub Code Verification
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-value">$0 Platform Fee</span>
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={13} color="#059669" /> Free to Post & Bid
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-value">ImageKit CDN</span>
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={13} color="#2563eb" /> Secure Media & Files
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
