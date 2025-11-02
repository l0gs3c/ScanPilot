import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scan } from '../pages/ScansPage';

const ScanDetailPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'results'>('output');
  const [output, setOutput] = useState<string[]>([]);
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Mock scan data - replace with actual API call
  useEffect(() => {
    if (scanId) {
      // Simulate API call
      setTimeout(() => {
        const mockScan: Scan = {
          id: parseInt(scanId),
          name: 'Subfinder Scan - example.com',
          targetId: 1,
          targetName: 'example.com',
          targetDomain: 'example.com',
          tool: 'subfinder',
          status: 'running',
          command: 'subfinder -d example.com -o /tmp/subfinder_output.txt -v',
          progress: 65,
          startedAt: '2024-11-02T10:30:00Z',
          createdAt: '2024-11-02T10:30:00Z',
          updatedAt: '2024-11-02T10:45:00Z'
        };
        setScan(mockScan);
        setIsLoading(false);
      }, 500);
    }
  }, [scanId]);

  // Mock real-time output updates
  useEffect(() => {
    if (scan && scan.status === 'running') {
      const outputLines = [
        '[INFO] Starting subfinder enumeration for example.com',
        '[INFO] Loading configuration from ~/.config/subfinder/config.yaml',
        '[INFO] Using DNS resolvers: 1.1.1.1, 8.8.8.8, 8.8.4.4',
        '[INFO] Found subdomain: www.example.com',
        '[INFO] Found subdomain: api.example.com',
        '[INFO] Found subdomain: mail.example.com',
        '[INFO] Found subdomain: admin.example.com',
        '[INFO] Found subdomain: blog.example.com',
        '[INFO] Found subdomain: shop.example.com',
        '[INFO] Found subdomain: cdn.example.com',
        '[INFO] Found subdomain: test.example.com',
        '[INFO] Checking certificate transparency logs...',
        '[INFO] Found subdomain: staging.example.com',
        '[INFO] Found subdomain: dev.example.com',
        '[INFO] Querying DNS records...',
        '[INFO] Found subdomain: ftp.example.com',
        '[INFO] Found subdomain: support.example.com',
        '[INFO] Enumeration completed. Found 12 subdomains.',
        '[INFO] Results saved to /tmp/subfinder_output.txt'
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < outputLines.length) {
          setOutput(prev => [...prev, outputLines[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
          // Update scan status to completed
          setScan(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
          
          // Load results
          const mockResults = `www.example.com
api.example.com
mail.example.com
admin.example.com
blog.example.com
shop.example.com
cdn.example.com
test.example.com
staging.example.com
dev.example.com
ftp.example.com
support.example.com`;
          setResults(mockResults);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [scan]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (autoScroll && outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, autoScroll]);

  const handleScanAction = (action: 'start' | 'pause' | 'stop' | 'restart') => {
    if (!scan) return;
    
    console.log(`Action ${action} on scan ${scan.id}`);
    
    // Update scan status based on action
    let newStatus: Scan['status'];
    switch (action) {
      case 'start':
        newStatus = 'running';
        break;
      case 'pause':
        newStatus = 'paused';
        break;
      case 'stop':
        newStatus = 'stopped';
        break;
      case 'restart':
        newStatus = 'running';
        setOutput([]); // Clear output for restart
        break;
      default:
        return;
    }
    
    setScan(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const downloadResults = () => {
    if (!results || !scan) return;
    
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scan.tool}_${scan.targetDomain}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadOutput = () => {
    if (!output.length || !scan) return;
    
    const outputText = output.join('\n');
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scan.tool}_output_${scan.targetDomain}_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading scan details...</span>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Scan Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The requested scan could not be found.'}</p>
        <button
          onClick={() => navigate('/scans')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Scans
        </button>
      </div>
    );
  }

  const getStatusIcon = (status: Scan['status']) => {
    switch (status) {
      case 'running':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
      case 'completed':
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case 'paused':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'stopped':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: Scan['status']) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/scans')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{scan.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-gray-600 dark:text-gray-400">Target:</span>
              <span className="font-medium text-gray-900 dark:text-white">{scan.targetDomain}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(scan.status)}
                  <span className="capitalize">{scan.status}</span>
                </div>
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          {scan.status === 'running' && (
            <>
              <button
                onClick={() => handleScanAction('pause')}
                className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                <span>Pause</span>
              </button>
              <button
                onClick={() => handleScanAction('stop')}
                className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                </svg>
                <span>Stop</span>
              </button>
            </>
          )}

          {scan.status === 'paused' && (
            <>
              <button
                onClick={() => handleScanAction('start')}
                className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Resume</span>
              </button>
              <button
                onClick={() => handleScanAction('stop')}
                className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                </svg>
                <span>Stop</span>
              </button>
            </>
          )}

          {(scan.status === 'completed' || scan.status === 'stopped' || scan.status === 'error') && (
            <button
              onClick={() => handleScanAction('restart')}
              className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Command</span>
            <div className="mt-2 bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm text-gray-800 dark:text-gray-200">
              {scan.command}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</span>
            <div className="mt-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${scan.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{scan.progress}%</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</span>
            <div className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {scan.startedAt ? formatDuration(scan.startedAt, scan.completedAt) : 'Not started'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('output')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'output'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Live Output
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Results
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'output' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Output</h3>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-scroll</span>
                  </label>
                  <button
                    onClick={downloadOutput}
                    disabled={output.length === 0}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Download Output
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {output.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    {scan.status === 'pending' ? 'Waiting for scan to start...' : 'No output yet...'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {output.map((line, index) => (
                      <div key={index} className="text-green-400">
                        {line}
                      </div>
                    ))}
                    <div ref={outputEndRef} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scan Results</h3>
                <button
                  onClick={downloadResults}
                  disabled={!results}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  Download Results
                </button>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
                {!results ? (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {scan.status === 'completed' ? 'No results available.' : 'Results will appear when scan is completed.'}
                  </div>
                ) : (
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {results}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function formatDuration(startTime: string, endTime?: string) {
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
  }
};

export default ScanDetailPage;