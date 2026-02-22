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

  // Mock data for development
  useEffect(() => {
    const mockScans: Scan[] = [
      {
        id: 1,
        name: 'Subfinder Scan - example.com',
        targetId: 1,
        targetName: 'example.com',
        targetDomain: 'example.com',
        tool: 'subfinder',
        status: 'running',
        command: 'subfinder -d example.com -o output.txt',
        progress: 45,
        startedAt: '2024-11-02T10:30:00Z',
        createdAt: '2024-11-02T10:30:00Z',
        updatedAt: '2024-11-02T10:30:00Z'
      },
      {
        id: 2,
        name: 'Directory Scan - api.example.com',
        targetId: 2,
        targetName: 'api.example.com',
        targetDomain: 'api.example.com',
        tool: 'dirsearch',
        status: 'completed',
        command: 'dirsearch -u https://api.example.com -e php,html,js',
        progress: 100,
        startedAt: '2024-11-02T09:15:00Z',
        completedAt: '2024-11-02T09:45:00Z',
        duration: '30m 15s',
        outputFile: 'dirsearch_api_example_com_2024-11-02_09-45.txt',
        createdAt: '2024-11-02T09:15:00Z',
        updatedAt: '2024-11-02T09:45:00Z'
      },
      {
        id: 3,
        name: 'Nuclei Vulnerability Scan',
        targetId: 1,
        targetName: 'example.com',
        targetDomain: 'example.com',
        tool: 'nuclei',
        status: 'paused',
        command: 'nuclei -u https://example.com -t cves/ -o nuclei_results.txt',
        progress: 65,
        startedAt: '2024-11-02T08:00:00Z',
        createdAt: '2024-11-02T08:00:00Z',
        updatedAt: '2024-11-02T08:30:00Z'
      },
      {
        id: 4,
        name: 'Failed Dirsearch Scan',
        targetId: 3,
        targetName: 'test.com',
        targetDomain: 'test.com',
        tool: 'dirsearch',
        status: 'error',
        command: 'dirsearch -u https://test.com',
        progress: 0,
        startedAt: '2024-11-02T07:30:00Z',
        errorMessage: 'Connection timeout - target unreachable',
        createdAt: '2024-11-02T07:30:00Z',
        updatedAt: '2024-11-02T07:35:00Z'
      }
    ];
    setScans(mockScans);
  }, []);

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
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scans Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and control your security scans</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tool:</span>
                <select
                  value={filterTool}
                  onChange={(e) => setFilterTool(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

      {/* Scans List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredScans.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scans found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all' || filterTool !== 'all' 
                  ? "No scans match your current filters." 
                  : "Get started by creating your first scan."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Scan
              </button>
            </div>
          ) : (
            filteredScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  {/* Scan Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getToolIcon(scan.tool)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {scan.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(scan.status)}
                          <span className="capitalize">{scan.status}</span>
                        </div>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Target:</span>
                        <br />
                        {scan.targetDomain}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Tool:</span>
                        <br />
                        <span className="capitalize">{scan.tool}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Duration:</span>
                        <br />
                        {scan.status === 'completed' ? scan.duration : formatDuration(scan.startedAt)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Progress:</span>
                        <br />
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${scan.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{scan.progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Command */}
                    <div className="mt-4">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Command</span>
                      <div className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                        {scan.command}
                      </div>
                    </div>

                    {/* Error Message */}
                    {scan.errorMessage && (
                      <div className="mt-4">
                        <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Error</span>
                        <div className="mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm text-red-700 dark:text-red-400">
                          {scan.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleViewDetails(scan)}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Details
                    </button>

                    {/* Control Buttons */}
                    <div className="flex flex-col space-y-1">
                      {scan.status === 'running' && (
                        <>
                          <button
                            onClick={() => handleScanAction(scan.id, 'pause')}
                            className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleScanAction(scan.id, 'stop')}
                            className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                          >
                            Stop
                          </button>
                        </>
                      )}

                      {scan.status === 'paused' && (
                        <>
                          <button
                            onClick={() => handleScanAction(scan.id, 'start')}
                            className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                          >
                            Resume
                          </button>
                          <button
                            onClick={() => handleScanAction(scan.id, 'stop')}
                            className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                          >
                            Stop
                          </button>
                        </>
                      )}

                      {(scan.status === 'completed' || scan.status === 'stopped' || scan.status === 'error') && (
                        <button
                          onClick={() => handleScanAction(scan.id, 'restart')}
                          className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          Restart
                        </button>
                      )}

                      <button
                        onClick={() => handleScanAction(scan.id, 'delete')}
                        className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Scan Modal */}
      <AddScanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(scanData) => {
          console.log('New scan:', scanData);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};

export default ScansPage;