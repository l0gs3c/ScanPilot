import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { targetAPI, Target, CreateTargetRequest, TargetFilters } from '../services/targetAPI'
import { Plus, Search, Edit, Trash2, Globe, Shield, Activity, Zap } from 'lucide-react'
import ScanConfigModal, { ScanData } from '../components/modals/ScanConfigModal'
import { useNavigate } from 'react-router-dom'

export default function TargetsPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [targets, setTargets] = useState<Target[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTarget, setEditingTarget] = useState<Target | null>(null)
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanningTarget, setScanningTarget] = useState<Target | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchTargets()
  }, [searchTerm, selectedStatus, currentPage])

  const fetchTargets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: TargetFilters = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        order_by: 'created_at',
        order_desc: true
      }

      if (searchTerm) filters.search = searchTerm
      if (selectedStatus) filters.status = selectedStatus

      const response = await targetAPI.getTargets(filters)
      setTargets(response.targets)
      setTotal(response.total)
    } catch (err) {
      console.error('Failed to fetch targets:', err)
      setError('Failed to load targets')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTarget = async (id: number) => {
    if (!confirm('Are you sure you want to delete this target?')) return

    try {
      await targetAPI.deleteTarget(id)
      await fetchTargets() // Refresh list
    } catch (err) {
      console.error('Failed to delete target:', err)
      setError('Failed to delete target')
    }
  }

  const handleStartScan = (target: Target) => {
    setScanningTarget(target)
    setShowScanModal(true)
  }

  const handleScanSubmit = async (scanData: ScanData) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/scans/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scanData)
      })

      if (response.ok) {
        const result = await response.json()
        setShowScanModal(false)
        setScanningTarget(null)
        
        // Show success and ask if user wants to view scan execution
        const viewScan = confirm(`âœ… Scan created successfully!\n\nScan ID: ${result.scan_id}\n\nDo you want to view the scan execution?`)
        if (viewScan) {
          // Navigate to scan execution page with scan_id in state
          navigate('/scan/execute', { state: { scanId: result.scan_id } })
        } else {
          // Refresh targets to see updated scan counts
          await fetchTargets()
        }
      } else {
        const error = await response.json()
        alert(`âŒ Error creating scan: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating scan:', error)
      alert('âŒ Failed to create scan')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanning':
        return <Activity className="w-4 h-4 text-blue-500" />
      case 'idle':
        return <Shield className="w-4 h-4 text-green-500" />
      default:
        return <Globe className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scanning':
        return 'bg-blue-100 text-blue-800'
      case 'idle':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && targets.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading targets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="targets-page">
      <div className="page-header">
        <div></div>
        <h1 className="page-title">ðŸŽ¯ Targets Management</h1>
        <p className="page-description">Manage your scan targets and monitor their status</p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filters">
          <div className="search-input">
            <Search className="w-4 h-4 search-icon" />
            <input
              type="text"
              placeholder="Search targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="idle">Idle</option>
            <option value="scanning">Scanning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="create-button"
        >
          <Plus className="w-4 h-4" />
          Add Target
        </button>
      </div>

      {error && (
        <div className="error-message">
          âŒ {error}
          <button onClick={fetchTargets} className="retry-button">
            ðŸ”„ Retry
          </button>
        </div>
      )}

      {/* Targets Table */}
      <div className="targets-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell header-cell">Name</div>
            <div className="table-cell header-cell">Target</div>
            <div className="table-cell header-cell">Status</div>
            <div className="table-cell header-cell">Scans</div>
            <div className="table-cell header-cell">Actions</div>
          </div>
        </div>
        
        <div className="table-body">
          {targets.map((target) => (
            <div key={target.id} className="table-row">
              <div className="table-cell">
                <div className="target-name">
                  {target.name}
                  {target.description && (
                    <div className="target-description">{target.description}</div>
                  )}
                </div>
              </div>
              
              <div className="table-cell">
                <div className="target-url">
                  <span className="domain-url" title={target.targetUrl || target.domain || 'N/A'}>
                    ðŸ”— {target.targetUrl || target.domain || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="table-cell">
                <span className={`status-badge ${getStatusColor(target.status)}`}>
                  {getStatusIcon(target.status)}
                  {target.status}
                </span>
              </div>

              <div className="table-cell">
                <div className="scan-counts">
                  <span className="active-scans">
                    â–¶ï¸ {target.activeScans} active
                  </span>
                  <span className="completed-scans">
                    âœ… {target.completedScans} completed
                  </span>
                </div>
              </div>

              <div className="table-cell">
                <div className="action-buttons">
                  <button
                    onClick={() => handleStartScan(target)}
                    className="scan-button"
                    title="Start new scan"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTarget(target)}
                    className="edit-button"
                    title="Edit target"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    className="delete-button"
                    title="Delete target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="page-button"
          >
            â† Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {Math.ceil(total / pageSize)} 
            ({total} total targets)
          </span>
          
          <button
            disabled={currentPage >= Math.ceil(total / pageSize)}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="page-button"
          >
            Next â†’
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTarget) && (
        <TargetModal
          target={editingTarget}
          onClose={() => {
            setShowCreateModal(false)
            setEditingTarget(null)
          }}
          onSave={() => {
            setShowCreateModal(false)
            setEditingTarget(null)
            fetchTargets()
          }}
        />
      )}

      {/* Scan Configuration Modal */}
      {showScanModal && scanningTarget && (
        <ScanConfigModal
          isOpen={showScanModal}
          onClose={() => {
            setShowScanModal(false)
            setScanningTarget(null)
          }}
          onSubmit={handleScanSubmit}
          preSelectedTargetId={scanningTarget.id}
        />
      )}

      <style jsx>{`
        .targets-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .page-title {
          font-size: 2.5rem;
          color: #333;
          margin: 10px 0;
        }

        .page-description {
          color: #666;
          font-size: 1.1rem;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 20px;
        }

        .search-filters {
          display: flex;
          gap: 15px;
        }

        .search-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          z-index: 1;
          color: #9ca3af;
        }

        .search-field {
          padding: 10px 10px 10px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          width: 250px;
          background: white;
          color: #111827;
        }

        .search-field:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .status-filter {
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          color: #111827;
          cursor: pointer;
        }

        .status-filter:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .create-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .create-button:hover {
          background: #2563eb;
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .retry-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .targets-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .table-header {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 15px;
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .header-cell {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .table-cell {
          display: flex;
          align-items: center;
          font-size: 14px;
        }

        .target-name {
          font-weight: 500;
          color: #111827;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .target-description {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .target-url {
          font-family: monospace;
          font-size: 13px;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .target-url span {
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wildcard-pattern {
          color: #8b5cf6;
          font-weight: 500;
        }

        .domain-url {
          color: #059669;
        }

        .port {
          color: #d97706;
          font-weight: 500;
        }

        .target-type {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .target-type.wildcard {
          background: #ede9fe;
          color: #7c3aed;
        }

        .target-type.specific {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .scan-counts {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12px;
        }

        .active-scans {
          color: #0ea5e9;
        }

        .completed-scans {
          color: #16a34a;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .scan-button, .edit-button, .delete-button {
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .scan-button {
          color: #3b82f6;
        }

        .scan-button svg {
          color: #3b82f6;
        }

        .edit-button svg {
          color: #6b7280;
        }

        .delete-button svg {
          color: #6b7280;
        }

        .scan-button:hover {
          background: #dbeafe;
          border-color: #60a5fa;
          color: #2563eb;
        }

        .scan-button:hover svg {
          color: #2563eb;
        }

        .edit-button:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .delete-button:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
        }

        .page-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .page-button:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: #6b7280;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .loading-spinner {
          text-align: center;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark Mode Styles */
        .dark .targets-page {
          background: var(--bg-secondary);
        }

        .dark .page-title {
          color: var(--text-primary);
        }

        .dark .page-description {
          color: var(--text-secondary);
        }

        .dark .search-icon {
          color: var(--text-tertiary);
        }

        .dark .search-field,
        .dark .status-filter {
          background: var(--bg-tertiary) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }

        .dark .status-filter option {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .dark .search-field::placeholder {
          color: var(--text-tertiary);
        }

        .dark .create-button {
          background: var(--accent-color);
        }

        .dark .create-button:hover {
          background: var(--accent-hover);
        }

        .dark .targets-table {
          background: var(--bg-primary) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          border-color: var(--border-color);
        }

        .dark .table-header {
          background: var(--bg-tertiary) !important;
          border-bottom-color: var(--border-color);
        }

        .dark .header-cell {
          color: var(--text-primary);
        }

        .dark .table-row {
          background: var(--bg-primary);
          border-bottom-color: var(--border-color);
        }

        .dark .table-row:hover {
          background: var(--bg-tertiary) !important;
        }

        .dark .target-name {
          color: var(--text-primary);
        }

        .dark .target-description {
          color: var(--text-secondary);
        }

        .dark .wildcard-pattern {
          color: #a78bfa;
        }

        .dark .domain-url {
          color: #34d399;
        }

        .dark .port {
          color: #fbbf24;
        }

        .dark .target-type.wildcard {
          background: #4c1d95;
          color: #c4b5fd;
        }

        .dark .target-type.specific {
          background: #065f46;
          color: #a7f3d0;
        }

        .dark .scan-button,
        .dark .edit-button,
        .dark .delete-button,
        .dark .page-button {
          background: var(--bg-tertiary);
          border-color: var(--border-color);
          color: var(--text-primary);
        }

        .dark .scan-button {
          color: #60a5fa;
        }

        .dark .scan-button svg {
          color: #60a5fa;
        }

        .dark .edit-button svg {
          color: #9ca3af;
        }

        .dark .delete-button svg {
          color: #fca5a5;
        }

        .dark .scan-button:hover {
          background: #1e3a5f;
          border-color: #3b82f6;
          color: #93c5fd;
        }

        .dark .scan-button:hover svg {
          color: #93c5fd;
        }

        .dark .edit-button:hover {
          background: #4b5563;
          border-color: #6b7280;
        }

        .dark .edit-button:hover svg {
          color: #d1d5db;
        }

        .dark .delete-button:hover {
          background: #7f1d1d;
          border-color: #991b1b;
          color: #fecaca;
        }

        .dark .delete-button:hover svg {
          color: #fecaca;
        }

        .dark .page-info {
          color: var(--text-secondary);
        }

        .dark .loading-spinner {
          color: var(--text-secondary);
        }

        .dark .spinner {
          border-color: var(--border-color);
          border-top-color: var(--accent-color);
        }

        .dark .error-message {
          background: var(--error-bg);
          color: var(--error-text);
          border-color: #991b1b;
        }

        .dark .retry-button {
          background: #991b1b;
        }

        .dark .retry-button:hover {
          background: #7f1d1d;
        }
      `}</style>
    </div>
  )
}

// Target Create/Edit Modal Component
interface TargetModalProps {
  target?: Target | null
  onClose: () => void
  onSave: () => void
}

function TargetModal({ target, onClose, onSave }: TargetModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [formData, setFormData] = useState<CreateTargetRequest>({
    name: target?.name || '',
    domain: target?.domain || '',
    port: target?.port || '',
    description: target?.description || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (target) {
        await targetAPI.updateTarget(target.id, formData)
      } else {
        await targetAPI.createTarget(formData)
      }
      onSave()
    } catch (err: any) {
      console.error('Failed to save target:', err)
      // Extract specific error message from API response
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save target'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f9fafb' : '#111827'
        }}
      >
        <div className="modal-header" style={{
          borderBottomColor: isDark ? '#374151' : '#e5e7eb'
        }}>
          <h2 style={{ color: isDark ? '#f9fafb' : '#111827' }}>
            {target ? 'Edit Target' : 'Create New Target'}
          </h2>
          <button 
            onClick={onClose} 
            className="close-button"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          >âœ•</button>
        </div>

        {error && (
          <div className="error-message" style={{
            background: isDark ? '#7f1d1d' : '#fee2e2',
            color: isDark ? '#fecaca' : '#dc2626',
            borderColor: isDark ? '#991b1b' : '#fecaca'
          }}>
            âŒ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="target-form">
          <div className="form-group">
            <label htmlFor="name" style={{ color: isDark ? '#f9fafb' : '#374151' }}>
              Target Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Production API Server"
              required
              disabled={loading}
              style={{
                background: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="domain" style={{ color: isDark ? '#f9fafb' : '#374151' }}>
              Domain/IP Address *
            </label>
            <input
              id="domain"
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
              placeholder="e.g., api.example.com or 192.168.1.1"
              required
              disabled={loading}
              style={{
                background: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="port" style={{ color: isDark ? '#f9fafb' : '#374151' }}>
              Port
            </label>
            <input
              id="port"
              type="text"
              value={formData.port}
              onChange={(e) => setFormData({...formData, port: e.target.value})}
              placeholder="e.g., 443, 80, 8080"
              disabled={loading}
              style={{
                background: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" style={{ color: isDark ? '#f9fafb' : '#374151' }}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description of this target"
              rows={3}
              disabled={loading}
              style={{
                background: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
              style={{
                background: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f9fafb' : '#374151',
                borderColor: isDark ? '#4b5563' : '#d1d5db'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`save-button ${loading ? 'loading' : ''}`}
              disabled={loading}
              style={{
                background: isDark ? '#1e40af' : '#3b82f6',
                color: '#ffffff'
              }}
            >
              {loading ? 'â³ Saving...' : 'ðŸ’¾ Save Target'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: #ffffff;
            border-radius: 12px;
            padding: 0;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #111827;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .close-button:hover {
            color: #374151;
          }

          .target-form {
            padding: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 6px;
            color: #374151;
          }

          .form-group input[type="text"],
          .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
          }

          .form-group input[type="text"]:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
          }

          .form-group input[type="checkbox"] {
            margin-right: 8px;
          }

          .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            margin-top: 30px;
          }

          .cancel-button,
          .save-button {
            padding: 10px 20px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .cancel-button {
            background: white;
            color: #374151;
          }

          .cancel-button:hover {
            background: #f3f4f6;
          }

          .save-button {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }

          .save-button:hover:not(:disabled) {
            background: #2563eb;
          }

          .save-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .error-message {
            background: var(--error-bg);
            color: var(--error-text);
            padding: 12px 16px;
            border-radius: 8px;
            margin: 0 20px;
            margin-bottom: 10px;
            border: 1px solid #fca5a5;
          }

          /* Dark Mode for Modal */
          .dark .modal-overlay {
            background: rgba(0, 0, 0, 0.7);
          }

          .dark .modal-content {
            background: #1f2937 !important;
          }

          .dark .modal-header {
            border-bottom-color: var(--border-color);
          }

          .dark .modal-header h2 {
            color: var(--text-primary);
          }

          .dark .close-button {
            color: var(--text-secondary);
          }

          .dark .close-button:hover {
            color: var(--text-primary);
          }

          .dark .form-group label {
            color: var(--text-primary);
          }

          .dark .form-group input[type="text"],
          .dark .form-group textarea {
            background: var(--bg-tertiary);
            border-color: var(--border-color);
            color: var(--text-primary);
          }

          .dark .form-group input[type="text"]::placeholder,
          .dark .form-group textarea::placeholder {
            color: var(--text-tertiary);
          }

          .dark .form-group input[type="text"]:focus,
          .dark .form-group textarea:focus {
            border-color: var(--accent-color);
          }

          .dark .cancel-button {
            background: var(--bg-tertiary);
            border-color: var(--border-color);
            color: var(--text-primary);
          }

          .dark .cancel-button:hover {
            background: #4b5563;
          }

          .dark .save-button {
            background: var(--accent-color);
            border-color: var(--accent-color);
          }

          .dark .save-button:hover:not(:disabled) {
            background: var(--accent-hover);
          }

          .dark .error-message {
            background: var(--error-bg);
            color: var(--error-text);
          }
        `}</style>
      </div>
    </div>
  )
}
