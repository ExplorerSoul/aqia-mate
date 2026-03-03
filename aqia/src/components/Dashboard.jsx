import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Award, Clock } from 'lucide-react';
import './Dashboard.css';

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setDashData(data);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        // Show empty state — do not crash
        setDashData({
          total_interviews: 0,
          highest_score: 0,
          avg_score: 0,
          recent_interviews: [],
          progress_data: [],
        });
      } finally {
        setLoadingDash(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleStartInterview = () => {
    navigate('/setup');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">AQIA Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.email?.split('@')[0]}! Ready to level up?</p>
        </div>
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleStartInterview}>
            New Interview
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {loadingDash ? (
        <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>Loading your stats...</p>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Activity size={24} />
              </div>
              <div className="metric-info">
                <h3>Total Interviews</h3>
                <p className="metric-value">{dashData.total_interviews}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.2)' }}>
                <Award size={24} />
              </div>
              <div className="metric-info">
                <h3>Highest Score</h3>
                <p className="metric-value">
                  {dashData.highest_score > 0 ? `${dashData.highest_score}%` : '—'}
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.2)' }}>
                <Clock size={24} />
              </div>
              <div className="metric-info">
                <h3>Avg Score</h3>
                <p className="metric-value">
                  {dashData.avg_score > 0 ? `${dashData.avg_score}%` : '—'}
                </p>
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
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="history-section">
              <h2 className="section-title">Recent Interviews</h2>
              <div className="history-list">
                {dashData.recent_interviews.length === 0 ? (
                  <p style={{ opacity: 0.5, textAlign: 'center', padding: '1rem' }}>
                    No interviews yet. Start one!
                  </p>
                ) : (
                  dashData.recent_interviews.map((interview) => (
                    <div key={interview.id} className="history-item">
                      <div className="history-details">
                        <h4>{interview.role}</h4>
                        <p className="history-date">{interview.date}</p>
                      </div>
                      <div className="history-score">
                        {interview.score != null ? `${interview.score}%` : '—'}
                      </div>
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
