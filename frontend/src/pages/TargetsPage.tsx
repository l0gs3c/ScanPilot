import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { targetAPI, Target, CreateTargetRequest, TargetFilters } from '../services/targetAPI'
import { Plus, Search, Edit, Trash2, Globe, Shield, Activity } from 'lucide-react'

export default function TargetsPage() {
  const { user } = useAuth()
  const [targets, setTargets] = useState<Target[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTarget, setEditingTarget] = useState<Target | null>(null)
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
        <h1 className="page-title">🎯 Targets Management</h1>
        <p className="page-description">Manage your scan targets and monitor their status</p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filters">
          <div className="search-input">
            <Search className="w-4 h-4 text-gray-400" />
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
          ❌ {error}
          <button onClick={fetchTargets} className="retry-button">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Targets Table */}
      <div className="targets-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell header-cell">Name</div>
            <div className="table-cell header-cell">Target</div>
            <div className="table-cell header-cell">Type</div>
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
                  {target.isWildcard ? (
                    <span className="wildcard-pattern">
                      🌐 {target.wildcardPattern}
                    </span>
                  ) : (
                    <span className="domain-url">
                      🔗 {target.targetUrl}
                      {target.port && target.port !== '80' && target.port !== '443' && (
                        <span className="port">:{target.port}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="table-cell">
                <span className={`target-type ${target.isWildcard ? 'wildcard' : 'specific'}`}>
                  {target.isWildcard ? '🌐 Wildcard' : '🎯 Specific'}
                </span>
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
                    ▶️ {target.activeScans} active
                  </span>
                  <span className="completed-scans">
                    ✅ {target.completedScans} completed
                  </span>
                </div>
              </div>

              <div className="table-cell">
                <div className="action-buttons">
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
            ← Previous
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
            Next →
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

        .search-input svg {
          position: absolute;
          left: 12px;
          z-index: 1;
        }

        .search-field {
          padding: 10px 10px 10px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          width: 250px;
        }

        .status-filter {
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
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
        }

        .table-header {
          background: #f8fafc;
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
        }

        .target-description {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .target-url {
          font-family: monospace;
          font-size: 13px;
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

        .edit-button, .delete-button {
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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
  const [formData, setFormData] = useState<CreateTargetRequest>({
    name: target?.name || '',
    domain: target?.domain || '',
    port: target?.port || '',
    wildcardPattern: target?.wildcardPattern || '',
    description: target?.description || '',
    isWildcard: target?.isWildcard || false,
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
    } catch (err) {
      console.error('Failed to save target:', err)
      setError('Failed to save target')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{target ? 'Edit Target' : 'Create New Target'}</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="target-form">
          <div className="form-group">
            <label htmlFor="name">Target Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Production API Server"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isWildcard}
                onChange={(e) => setFormData({...formData, isWildcard: e.target.checked})}
                disabled={loading}
              />
              Wildcard Target (for subdomain discovery)
            </label>
          </div>

          {formData.isWildcard ? (
            <div className="form-group">
              <label htmlFor="wildcardPattern">Wildcard Pattern *</label>
              <input
                id="wildcardPattern"
                type="text"
                value={formData.wildcardPattern}
                onChange={(e) => setFormData({...formData, wildcardPattern: e.target.value})}
                placeholder="e.g., *.example.com"
                required
                disabled={loading}
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="domain">Domain/IP Address *</label>
                <input
                  id="domain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="e.g., api.example.com or 192.168.1.1"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="port">Port</label>
                <input
                  id="port"
                  type="text"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: e.target.value})}
                  placeholder="e.g., 443, 80, 8080"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description of this target"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`save-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '💾 Save Target'}
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
            background: white;
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
        `}</style>
      </div>
    </div>
  )
}