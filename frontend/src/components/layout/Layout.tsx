import React, { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Home, Target, Activity, Settings, LogOut, User } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Targets', href: '/targets', icon: Target },
    { name: 'Scans', href: '/scans', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout()
    }
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">🔍 ScanPilot</h1>
          <p className="app-subtitle">Security Scanning Platform</p>
        </div>

        <nav className="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <User className="w-5 h-5" />
              </div>
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">
                  {user?.is_admin ? '👑 Admin' : '👤 User'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 30px 20px;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        }

        .app-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .app-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .nav-menu {
          flex: 1;
          padding: 20px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
        }

        .nav-text {
          font-size: 14px;
        }

        .sidebar-footer {
          border-top: 1px solid #e5e7eb;
          padding: 20px;
        }

        .user-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .user-role {
          font-size: 12px;
          color: #6b7280;
        }

        .logout-button {
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-button:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .content-wrapper {
          flex: 1;
          padding: 0;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 240px;
          }
          
          .sidebar-header {
            padding: 20px 15px;
          }
          
          .app-title {
            font-size: 1.5rem;
          }
          
          .nav-menu {
            padding: 15px;
          }
          
          .nav-item {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  )
}