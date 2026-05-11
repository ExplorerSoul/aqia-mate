import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Award, Clock } from 'lucide-react';
import './Dashboard.css';

// ─── Community Spotlight data ─────────────────────────────────────────────────
// To add a real user: add their photo to public/users/filename.jpg
// and set imagePath: '/users/filename.jpg'
const SPOTLIGHT_USERS = [
  {
    name: 'Priya Sharma',
    college: 'IIT Bombay',
    year: '3rd Year',
    domain: 'Software Engineering',
    avgScore: 88,
    imagePath: null,
  },
  {
    name: 'Arjun Mehta',
    college: 'NIT Trichy',
    year: '4th Year',
    domain: 'Data Science',
    avgScore: 82,
    imagePath: null,
  },
  {
    name: 'Sneha Reddy',
    college: 'BITS Pilani',
    year: '2024 Graduate',
    domain: 'Product Management',
    avgScore: 91,
    imagePath: null,
  },
  {
    name: 'Rahul Verma',
    college: 'VIT Vellore',
    year: '3rd Year',
    domain: 'DevOps',
    avgScore: 79,
    imagePath: null,
  },
  {
    name: 'Ananya Iyer',
    college: 'IIIT Hyderabad',
    year: '2nd Year',
    domain: 'Machine Learning',
    avgScore: 85,
    imagePath: null,
  },
  {
    name: 'Karan Patel',
    college: 'DTU Delhi',
    year: '4th Year',
    domain: 'Software Engineering',
    avgScore: 76,
    imagePath: null,
  },
];

const DOMAIN_COLORS = {
  'Software Engineering': '#7C3AED',
  'Data Science':         '#0EA5E9',
  'Product Management':   '#EC4899',
  'DevOps':               '#10B981',
  'Machine Learning':     '#F59E0B',
};

function scoreColor(score) {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

// ─── Single spotlight card ────────────────────────────────────────────────────
function SpotlightCard({ user, isActive }) {
  const domainColor = DOMAIN_COLORS[user.domain] || '#6366F1';
  const sc = scoreColor(user.avgScore);
  const initials = getInitials(user.name);

  return (
    <div className={`spotlight-card ${isActive ? 'spotlight-card--active' : ''}`}
         style={{ '--domain-color': domainColor }}>
      {/* Avatar */}
      <div className="spotlight-avatar" style={{ background: `linear-gradient(135deg, ${domainColor}, ${domainColor}99)` }}>
        {user.imagePath
          ? <img src={user.imagePath} alt={user.name} className="spotlight-avatar-img" />
          : <span className="spotlight-initials">{initials}</span>
        }
      </div>

      {/* Info */}
      <div className="spotlight-info">
        <p className="spotlight-name">{user.name}</p>
        <p className="spotlight-college">🎓 {user.college} · {user.year}</p>
        <span className="spotlight-domain" style={{ color: domainColor, borderColor: `${domainColor}66`, background: `${domainColor}18` }}>
          {user.domain}
        </span>
      </div>

      {/* Score */}
      <div className="spotlight-score-wrap">
        <div className="spotlight-score-ring" style={{ borderColor: `${sc}88`, background: `${sc}18` }}>
          <span className="spotlight-score-value" style={{ color: sc }}>{user.avgScore}</span>
          <span className="spotlight-score-pct" style={{ color: sc }}>%</span>
        </div>
        <p className="spotlight-score-label">Avg Score</p>
      </div>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function CommunitySpotlight() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const dragStart = useRef(null);
  const total = SPOTLIGHT_USERS.length;

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    setCurrent((idx + total) % total);
    startTimer();
  };

  // Touch / mouse drag support
  const onDragStart = (e) => {
    dragStart.current = e.touches ? e.touches[0].clientX : e.clientX;
    clearInterval(timerRef.current);
  };
  const onDragEnd = (e) => {
    if (dragStart.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart.current - endX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    } else {
      startTimer();
    }
    dragStart.current = null;
  };

  return (
    <section className="spotlight-section">
      <div className="spotlight-header">
        <div className="spotlight-title-row">
          <div className="spotlight-accent-bar" />
          <h2 className="spotlight-title">Community Spotlight</h2>
        </div>
        <div className="spotlight-live">
          <span className="spotlight-live-dot" />
          <span className="spotlight-live-text">LIVE</span>
        </div>
      </div>

      {/* Track */}
      <div
        className="spotlight-track"
        ref={trackRef}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        <div
          className="spotlight-slides"
          style={{ transform: `translateX(calc(-${current * 100}% / 1))` }}
        >
          {/* Duplicate for seamless feel */}
          {[...SPOTLIGHT_USERS, ...SPOTLIGHT_USERS].map((user, i) => (
            <div key={i} className="spotlight-slide">
              <SpotlightCard user={user} isActive={i % total === current} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="spotlight-dots">
        {SPOTLIGHT_USERS.map((_, i) => (
          <button
            key={i}
            className={`spotlight-dot ${i === current ? 'spotlight-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ setAppData }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseUrl}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setDashData(data);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setDashData({ total_interviews: 0, highest_score: 0, avg_score: 0, recent_interviews: [], progress_data: [] });
      } finally {
        setLoadingDash(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">AQIA Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.email?.split('@')[0]}! Ready to level up?</p>
        </div>
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/setup')}>New Interview</button>
          <button className="btn-secondary" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </header>

      {/* Community Spotlight */}
      <CommunitySpotlight />

      {loadingDash ? (
        <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>Loading your stats...</p>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><Activity size={24} /></div>
              <div className="metric-info">
                <h3>Total Interviews</h3>
                <p className="metric-value">{dashData.total_interviews}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ color: '#34d399', background: 'rgba(52,211,153,0.2)' }}>
                <Award size={24} />
              </div>
              <div className="metric-info">
                <h3>Highest Score</h3>
                <p className="metric-value">{dashData.highest_score > 0 ? `${dashData.highest_score}%` : '—'}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.2)' }}>
                <Clock size={24} />
              </div>
              <div className="metric-info">
                <h3>Avg Score</h3>
                <p className="metric-value">{dashData.avg_score > 0 ? `${dashData.avg_score}%` : '—'}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="chart-section">
              <h2 className="section-title">Progress Overview</h2>
              <div className="chart-container">
                {dashData.progress_data.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.5, paddingTop: '4rem' }}>
                    Complete an interview to see your progress chart.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashData.progress_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="history-section">
              <h2 className="section-title">Recent Interviews</h2>
              <div className="history-list">
                {dashData.recent_interviews.length === 0 ? (
                  <p style={{ opacity: 0.5, textAlign: 'center', padding: '1rem' }}>No interviews yet. Start one!</p>
                ) : (
                  dashData.recent_interviews.map((interview) => (
                    <div key={interview.id} className="history-item">
                      <div className="history-details">
                        <h4>{interview.role}</h4>
                        <p className="history-date">{interview.date}</p>
                      </div>
                      <div className="history-score">{interview.score != null ? `${interview.score}%` : '—'}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
