import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ScanConfigModal, { ScanData } from '../components/modals/ScanConfigModal';
import Terminal from '../components/ui/Terminal';
import { useAuth } from '../contexts/AuthContext';

const ScanExecutionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanInfo, setScanInfo] = useState<{ tool: string; target: string } | null>(null);

  // Check for scan ID from navigation state
  useEffect(() => {
    const state = location.state as { scanId?: string } | null;
    if (state?.scanId) {
      setCurrentScanId(state.scanId);
      // Optionally fetch scan details to populate scanInfo
      fetchScanDetails(state.scanId);
    }
  }, [location.state]);

  const fetchScanDetails = async (scanId: string) => {
    try {
      const response = await fetch(`/api/v1/scans/${scanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const scan = await response.json();
        setScanInfo({ 
          tool: scan.tool, 
          target: scan.target_id ? `Target #${scan.target_id}` : 'Unknown'
        });
      }
    } catch (error) {
      console.error('Error fetching scan details:', error);
    }
  };

  const handleStartScan = async (scanData: ScanData) => {
    try {
      // Create scan via API
      const response = await fetch('/api/v1/scans/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scanData)
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentScanId(result.scan_id);
        setScanInfo({ tool: scanData.tool, target: `Target #${scanData.target_id}` });
        console.log('Scan created:', result);
      } else {
        const error = await response.json();
        alert(`Error creating scan: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating scan:', error);
      alert('Failed to create scan');
    }
  };

  const handleNewScan = () => {
    setCurrentScanId(null);
    setScanInfo(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan Execution</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure and run security scans with real-time output
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/scans')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>View All Scans</span>
          </button>
          <button
            onClick={handleNewScan}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Scan Info Card */}
      {scanInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                Running: {scanInfo.tool.toUpperCase()} Scan
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Target: <span className="font-mono">{scanInfo.target}</span>
              </p>
              <p className="text-blue-600 dark:text-blue-500 text-xs mt-1">
                Scan ID: {currentScanId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal */}
      {currentScanId ? (
        <Terminal scanId={currentScanId} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Scan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure and start a new security scan to see real-time output
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Configure New Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Scan Configuration Modal */}
      <ScanConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStartScan}
      />
    </div>
  );
};

export default ScanExecutionPage;
