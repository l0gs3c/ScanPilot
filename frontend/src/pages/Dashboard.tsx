import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

interface Target {
  id: string
  name: string
  host: string
  port: number
  protocol: string
  status: string
  created_at: string
  updated_at: string
}

interface Scan {
  id: string
  target_id: string
  tool_name: string
  status: string
  progress: number
  started_at: string
  completed_at: string | null
  results_count: number
}

interface DashboardStats {
  total_targets: number
  active_scans: number
  completed_scans: number
  failed_scans: number
  recent_scans: Scan[]
  user: string
}

const API_BASE = 'http://localhost:8000'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [targets, setTargets] = useState<Target[]>([])
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, targetsRes, scansRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/dashboard/stats`),
        axios.get(`${API_BASE}/api/v1/targets`),
        axios.get(`${API_BASE}/api/v1/scans`)
      ])

      setStats(statsRes.data)
      setTargets(targetsRes.data.targets)
      setScans(scansRes.data.scans)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.')
      } else {
        setError('Failed to load dashboard data. Please check if backend server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getStatusClass = (status: string) => {
    return `status-badge status-${status.toLowerCase().replace(' ', '_')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-message">Loading ScanPilot Dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>⚠️ Unable to load dashboard</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchData} className="retry-button">
              🔄 Retry
            </button>
            <button onClick={handleLogout} className="logout-error-button">
              👋 Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">📊 Dashboard</h1>
        <p className="page-description">Overview of your security scanning activities</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_targets}</div>
            <div className="stat-label">Total Targets</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active_scans}</div>  
            <div className="stat-label">Active Scans</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed_scans}</div>
            <div className="stat-label">Completed Scans</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.failed_scans}</div>
            <div className="stat-label">Failed Scans</div>
          </div>
        </div>
      )}

      <section className="section">
        <h2>📋 Targets</h2>
        <div className="targets-list">
          {targets.map(target => (
            <div key={target.id} className="item-card">
              <div className="item-header">
                <div className="item-title">{target.name}</div>
                <span className={getStatusClass(target.status)}>
                  {target.status.replace('_', ' ')}
                </span>
              </div>
              <div className="item-details">
                <div><strong>Host:</strong> {target.protocol}://{target.host}:{target.port}</div>
                <div><strong>Created:</strong> {formatDate(target.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>🔄 Recent Scans</h2>
        <div className="scans-list">
          {scans.map(scan => (
            <div key={scan.id} className="item-card">
              <div className="item-header">
                <div className="item-title">{scan.tool_name}</div>
                <span className={getStatusClass(scan.status)}>
                  {scan.status}
                </span>
              </div>
              <div className="item-details">
                <div><strong>Started:</strong> {formatDate(scan.started_at)}</div>
                {scan.completed_at && (
                  <div><strong>Completed:</strong> {formatDate(scan.completed_at)}</div>
                )}
                {scan.status === 'running' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${scan.progress}%` }}
                    ></div>
                  </div>
                )}
                <div><strong>Progress:</strong> {scan.progress}%</div>
                {scan.results_count > 0 && (
                  <div><strong>Results:</strong> {scan.results_count}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 2.5rem;
          color: #111827;
          margin: 0 0 10px 0;
          font-weight: 700;
        }

        .page-description {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
        }

        .loading-message {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          text-align: center;
          padding: 40px 20px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          margin-bottom: 20px;
        }

        .error-actions {
          margin-top: 20px;
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .retry-button, .logout-error-button {
          padding: 10px 20px;
          border: 1px solid currentColor;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .retry-button:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        .logout-error-button:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 20px;
          }
          
          .page-title {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .stat-card {
            padding: 20px;
          }

          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}