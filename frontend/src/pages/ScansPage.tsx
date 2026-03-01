import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddScanModal from '../components/modals/AddScanModal';

// Scan status types
export type ScanStatus = 'pending' | 'running' | 'completed' | 'paused' | 'stopped' | 'error';

// Tool types
export type ToolType = 'subfinder' | 'dirsearch' | 'nuclei';

// Scan interface
export interface Scan {
  id: number;
  name: string;
  targetId: number;
  targetName: string;
  targetDomain: string;
  tool: ToolType;
  status: ScanStatus;
  command: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  outputFile?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const ScansPage: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch scans from API
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/scans/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scans: ${response.statusText}`);
      }

      const data = await response.json();
      // API returns { value: [...], count: number }
      setScans(data.value || []);
    } catch (err) {
      console.error('Error fetching scans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scans');
      setScans([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new scan
  const handleCreateScan = async (scanData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/scans/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scanData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create scan');
      }

      const result = await response.json();
      console.log('Scan created:', result);
      
      // Refresh scans list
      await fetchScans();
      
      // Close modal
      setIsAddModalOpen(false);
      
      // Show success message (optional)
      alert(`Scan created successfully! ID: ${result.scan_id}`);
    } catch (err) {
      console.error('Error creating scan:', err);
      alert(err instanceof Error ? err.message : 'Failed to create scan');
    }  
  };

  // Filter scans based on search term and filters
  const filteredScans = scans.filter(scan => {
    const matchesSearch = searchTerm === '' || 
      scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.targetDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.tool.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || scan.status === filterStatus;
    const matchesTool = filterTool === 'all' || scan.tool === filterTool;
    
    return matchesSearch && matchesStatus && matchesTool;
  });

  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case 'completed':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'paused':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'stopped':
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: ScanStatus) => {
    switch (status) {
      case 'running':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'completed':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'stopped':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'subfinder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'dirsearch':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        );
      case 'nuclei':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const handleScanAction = (scanId: number, action: 'start' | 'pause' | 'stop' | 'restart' | 'delete') => {
    console.log(`Action ${action} on scan ${scanId}`);
    // TODO: Implement actual scan control actions
  };

  const handleViewDetails = (scan: Scan) => {
    navigate(`/scans/${scan.id}`);
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scans Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitor and control your security scans</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Scan</span>
        </button>
      </div>

      <div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search scans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-3 py-1.5 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="stopped">Stopped</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tool:</span>
                <select
                  value={filterTool}
                  onChange={(e) => setFilterTool(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Tools</option>
                  <option value="subfinder">Subfinder</option>
                  <option value="dirsearch">Dirsearch</option>
                  <option value="nuclei">Nuclei</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-400 font-medium">Error loading scans</span>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading scans...</span>
        </div>
      )}

      {/* Scans Table */}
      {!isLoading && (
        <>
          {filteredScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <svg style={{ width: 48, height: 48, margin: '0 auto 16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>No scans found</h3>
              <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                {searchTerm || filterStatus !== 'all' || filterTool !== 'all' 
                  ? "No scans match your current filters." 
                  : "Get started by creating your first scan."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Create New Scan
              </button>
            </div>
          ) : (
            <div className="scans-table">
              <div className="scans-table-header">
                <div className="scans-table-row">
                  <div className="scans-cell scans-header-cell">Name</div>
                  <div className="scans-cell scans-header-cell">Target</div>
                  <div className="scans-cell scans-header-cell">Tool</div>
                  <div className="scans-cell scans-header-cell">Status</div>
                  <div className="scans-cell scans-header-cell">Duration</div>
                  <div className="scans-cell scans-header-cell">Progress</div>
                  <div className="scans-cell scans-header-cell">Actions</div>
                </div>
              </div>
              <div className="scans-table-body">
                {filteredScans.map((scan) => (
                  <div key={scan.id} className="scans-table-row">
                    <div className="scans-cell">
                      <div className="scan-name-cell">
                        <span className="scan-name-icon">{getToolIcon(scan.tool)}</span>
                        <div className="scan-name-text">
                          <span className="scan-name-title">{scan.name}</span>
                          {scan.command && (
                            <span className="scan-name-cmd" title={scan.command}>{scan.command}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="scans-cell">
                      <span className="scan-target-link" title={scan.targetDomain}>
                        🔗 {scan.targetDomain}
                      </span>
                    </div>
                    <div className="scans-cell">
                      <span className={`scan-tool-badge scan-tool-${scan.tool}`}>{scan.tool}</span>
                    </div>
                    <div className="scans-cell">
                      <span className={`scan-status-badge scan-status-${scan.status}`}>
                        {getStatusIcon(scan.status)}
                        <span style={{ textTransform: 'uppercase' }}>{scan.status}</span>
                      </span>
                    </div>
                    <div className="scans-cell">
                      <span className="scan-duration">
                        {scan.status === 'completed' ? scan.duration : formatDuration(scan.startedAt) || 'N/A'}
                      </span>
                    </div>
                    <div className="scans-cell">
                      <div className="scan-progress-wrapper">
                        <div className="scan-progress-bar">
                          <div className="scan-progress-fill" style={{ width: `${scan.progress}%` }}></div>
                        </div>
                        <span className="scan-progress-text">{scan.progress}%</span>
                      </div>
                    </div>
                    <div className="scans-cell">
                      <div className="scan-actions">
                        <button onClick={() => handleViewDetails(scan)} className="scan-action-btn scan-action-view" title="View Details">
                          👁
                        </button>
                        {scan.status === 'running' && (
                          <>
                            <button onClick={() => handleScanAction(scan.id, 'pause')} className="scan-action-btn scan-action-pause" title="Pause">
                              ⏸
                            </button>
                            <button onClick={() => handleScanAction(scan.id, 'stop')} className="scan-action-btn scan-action-stop" title="Stop">
                              ⏹
                            </button>
                          </>
                        )}
                        {scan.status === 'paused' && (
                          <>
                            <button onClick={() => handleScanAction(scan.id, 'start')} className="scan-action-btn scan-action-resume" title="Resume">
                              ▶
                            </button>
                            <button onClick={() => handleScanAction(scan.id, 'stop')} className="scan-action-btn scan-action-stop" title="Stop">
                              ⏹
                            </button>
                          </>
                        )}
                        {(scan.status === 'completed' || scan.status === 'stopped' || scan.status === 'error') && (
                          <button onClick={() => handleScanAction(scan.id, 'restart')} className="scan-action-btn scan-action-restart" title="Restart">
                            🔄
                          </button>
                        )}
                        <button onClick={() => handleScanAction(scan.id, 'delete')} className="scan-action-btn scan-action-delete" title="Delete">
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Scan Modal */}
      <AddScanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateScan}
      />

      <style>{`
        /* ===== SCANS TABLE - LIGHT MODE ===== */
        .scans-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .scans-table-header {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .scans-table-row {
          display: grid;
          grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1fr 1.2fr 1.2fr;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }

        .scans-table-body .scans-table-row:last-child {
          border-bottom: none;
        }

        .scans-table-body .scans-table-row:hover {
          background: #f8fafc;
        }

        .scans-cell {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #374151;
          min-width: 0;
        }

        .scans-header-cell {
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* Name cell */
        .scan-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .scan-name-icon {
          flex-shrink: 0;
          color: #6b7280;
        }

        .scan-name-icon svg {
          width: 18px;
          height: 18px;
        }

        .scan-name-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scan-name-title {
          font-weight: 500;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .scan-name-cmd {
          font-size: 11px;
          color: #9ca3af;
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 300px;
        }

        /* Target cell */
        .scan-target-link {
          color: #059669;
          font-family: monospace;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Tool badge */
        .scan-tool-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .scan-tool-subfinder {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .scan-tool-dirsearch {
          background: #fef3c7;
          color: #b45309;
        }

        .scan-tool-nuclei {
          background: #ede9fe;
          color: #7c3aed;
        }

        /* Status badge */
        .scan-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .scan-status-pending { background: #f3f4f6; color: #6b7280; }
        .scan-status-running { background: #d1fae5; color: #065f46; }
        .scan-status-completed { background: #dbeafe; color: #1e40af; }
        .scan-status-paused { background: #fef3c7; color: #92400e; }
        .scan-status-stopped { background: #f3f4f6; color: #374151; }
        .scan-status-error { background: #fee2e2; color: #991b1b; }

        /* Duration */
        .scan-duration {
          font-size: 13px;
          color: #374151;
          font-variant-numeric: tabular-nums;
        }

        /* Progress */
        .scan-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .scan-progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 99px;
          overflow: hidden;
        }

        .scan-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          border-radius: 99px;
          transition: width 0.3s;
        }

        .scan-progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          min-width: 32px;
          text-align: right;
        }

        /* Actions */
        .scan-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .scan-action-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s;
        }

        .scan-action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .scan-action-view:hover {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .scan-action-delete:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        /* ===== DARK MODE ===== */
        .dark .scans-table {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .dark .scans-table-header {
          background: #374151;
          border-bottom-color: #4b5563;
        }

        .dark .scans-header-cell {
          color: #f9fafb;
        }

        .dark .scans-table-row {
          border-bottom-color: #374151;
        }

        .dark .scans-table-body .scans-table-row {
          background: #1f2937;
        }

        .dark .scans-table-body .scans-table-row:hover {
          background: #374151 !important;
        }

        .dark .scans-cell {
          color: #e5e7eb;
        }

        .dark .scan-name-title {
          color: #f9fafb;
        }

        .dark .scan-name-cmd {
          color: #6b7280;
        }

        .dark .scan-name-icon {
          color: #9ca3af;
        }

        .dark .scan-target-link {
          color: #34d399;
        }

        .dark .scan-tool-subfinder {
          background: #1e3a5f;
          color: #93c5fd;
        }

        .dark .scan-tool-dirsearch {
          background: #78350f;
          color: #fde68a;
        }

        .dark .scan-tool-nuclei {
          background: #4c1d95;
          color: #c4b5fd;
        }

        .dark .scan-status-pending { background: #374151; color: #d1d5db; }
        .dark .scan-status-running { background: #065f46; color: #a7f3d0; }
        .dark .scan-status-completed { background: #1e3a5f; color: #93c5fd; }
        .dark .scan-status-paused { background: #78350f; color: #fde68a; }
        .dark .scan-status-stopped { background: #374151; color: #d1d5db; }
        .dark .scan-status-error { background: #7f1d1d; color: #fca5a5; }

        .dark .scan-duration {
          color: #d1d5db;
        }

        .dark .scan-progress-bar {
          background: #374151;
        }

        .dark .scan-progress-text {
          color: #d1d5db;
        }

        .dark .scan-action-btn {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }

        .dark .scan-action-btn:hover {
          background: #4b5563;
          border-color: #6b7280;
        }

        .dark .scan-action-view:hover {
          background: #1e3a5f;
          border-color: #3b82f6;
        }

        .dark .scan-action-delete:hover {
          background: #7f1d1d;
          border-color: #991b1b;
        }
      `}</style>
    </div>
  );
};

export default ScansPage;