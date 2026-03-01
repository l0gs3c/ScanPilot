import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Target {
  id: number;
  name: string;
  domain: string;
  type: string;
  port?: number;
}

interface AddScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scanData: ScanData) => void;
}

export interface ScanData {
  tool: 'subfinder' | 'dirsearch' | 'nuclei';
  target_id: number;
  config: Record<string, any>;
}

const AddScanModal: React.FC<AddScanModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTool, setSelectedTool] = useState<'subfinder' | 'dirsearch' | 'nuclei'>('subfinder');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  
  // Tool configurations
  const [subfinderConfig, setSubfinderConfig] = useState({
    silent: false,
    verbose: false,
    threads: 10,
    timeout: 30,
    all: false
  });
  
  const [dirsearchConfig, setDirsearchConfig] = useState({
    extensions: ['php', 'html', 'js'],
    wordlist: 'wordlist/common.txt',
    threads: 20,
    recursive: false,
    exclude_status: [404, 403],
    random_agent: true
  });
  
  const [nucleiConfig, setNucleiConfig] = useState({
    templates: ['cves/', 'vulnerabilities/'],
    severity: ['critical', 'high', 'medium'],
    threads: 10,
    rate_limit: 150,
    timeout: 5,
    verbose: false
  });

  // Load targets
  useEffect(() => {
    if (isOpen && token) {
      fetch('/api/v1/targets?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setTargets(data.targets || []);
        })
        .catch(console.error);
    }
  }, [isOpen, token]);

  const handleSubmit = () => {
    if (!selectedTargetId) {
      alert('Please select a target');
      return;
    }

    const target = targets.find(t => t.id === selectedTargetId);
    if (!target) return;

    let config = {};
    switch (selectedTool) {
      case 'subfinder':
        config = subfinderConfig;
        break;
      case 'dirsearch':
        config = dirsearchConfig;
        break;
      case 'nuclei':
        config = nucleiConfig;
        break;
    }

    const scanData: ScanData = {
      tool: selectedTool,
      target_id: target.id,
      config
    };

    onSubmit(scanData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className="rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto add-scan-modal" style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff'
      }}>
        <style>{`
          .add-scan-modal input[type="text"],
          .add-scan-modal input[type="number"],
          .add-scan-modal select {
            background-color: ${isDark ? '#374151' : '#ffffff'} !important;
            border-color: ${isDark ? '#4b5563' : '#d1d5db'} !important;
            color: ${isDark ? '#ffffff' : '#111827'} !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            padding: 16px 20px !important;
            min-height: 52px !important;
          }
          .add-scan-modal label {
            color: ${isDark ? '#d1d5db' : '#374151'} !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            margin-bottom: 10px !important;
            display: block !important;
          }
          .add-scan-modal .border {
            border-color: ${isDark ? '#374151' : '#e5e7eb'} !important;
          }
        `}</style>
        {/* Header */}
        <div className="sticky top-0 border-b flex items-center justify-between z-10" style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
          padding: '14px 28px'
        }}>
          <h2 className="text-xl font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Create New Scan</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#d1d5db' : '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '18px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium" style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: '13px', marginBottom: '8px' }}>
              Select Target *
            </label>
            <select
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                color: isDark ? '#ffffff' : '#111827',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              <option value="">Select a target...</option>
              {targets.map(target => (
                <option key={target.id} value={target.id}>
                  {target.name || target.domain} ({target.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Tool Selection */}
          <div>
            <label className="block text-sm font-medium" style={{ color: isDark ? '#d1d5db' : '#374151', fontSize: '13px', marginBottom: '8px' }}>
              Select Tool *
            </label>
            <div className="grid grid-cols-3" style={{ gap: '12px' }}>
              {['subfinder', 'dirsearch', 'nuclei'].map(tool => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => setSelectedTool(tool as any)}
                  className="rounded-lg border-2 transition-all"
                  style={{
                    borderColor: selectedTool === tool ? '#3b82f6' : (isDark ? '#4b5563' : '#d1d5db'),
                    backgroundColor: selectedTool === tool ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff') : 'transparent',
                    color: selectedTool === tool ? (isDark ? '#60a5fa' : '#1d4ed8') : (isDark ? '#d1d5db' : '#374151'),
                    fontSize: '14px',
                    lineHeight: '1.5',
                    padding: '10px 14px',
                    minHeight: '44px'
                  }}
                >
                  <div className="font-medium capitalize">{tool}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Configuration */}
          <div className="rounded-lg" style={{
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            padding: '20px'
          }}>
            <h3 className="text-base font-semibold capitalize" style={{ color: isDark ? '#ffffff' : '#111827', fontSize: '15px', marginBottom: '16px' }}>
              {selectedTool} Configuration
            </h3>

            {/* Subfinder Config */}
            {selectedTool === 'subfinder' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                  <div>
                    <label>
                      Threads
                    </label>
                    <input
                      type="number"
                      value={subfinderConfig.threads}
                      onChange={(e) => setSubfinderConfig({...subfinderConfig, threads: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                  <div>
                    <label>
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={subfinderConfig.timeout}
                      onChange={(e) => setSubfinderConfig({...subfinderConfig, timeout: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: '32px' }}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subfinderConfig.verbose}
                      onChange={(e) => setSubfinderConfig({...subfinderConfig, verbose: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: isDark ? '#d1d5db' : '#111827' }}>Verbose output</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subfinderConfig.all}
                      onChange={(e) => setSubfinderConfig({...subfinderConfig, all: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: isDark ? '#d1d5db' : '#111827' }}>Use all sources</span>
                  </label>
                </div>
              </div>
            )}

            {/* Dirsearch Config */}
            {selectedTool === 'dirsearch' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label>
                    Extensions (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={dirsearchConfig.extensions.join(',')}
                    onChange={(e) => setDirsearchConfig({...dirsearchConfig, extensions: e.target.value.split(',')})}
                    className="w-full border rounded-lg"
                    placeholder="php,html,js"
                  />
                </div>
                <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                  <div>
                    <label>
                      Threads
                    </label>
                    <input
                      type="number"
                      value={dirsearchConfig.threads}
                      onChange={(e) => setDirsearchConfig({...dirsearchConfig, threads: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                  <div>
                    <label>
                      Wordlist Path
                    </label>
                    <input
                      type="text"
                      value={dirsearchConfig.wordlist}
                      onChange={(e) => setDirsearchConfig({...dirsearchConfig, wordlist: e.target.value})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: '32px' }}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dirsearchConfig.recursive}
                      onChange={(e) => setDirsearchConfig({...dirsearchConfig, recursive: e.target.checked})}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                    />
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: isDark ? '#d1d5db' : '#111827' }}>Recursive scan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dirsearchConfig.random_agent}
                      onChange={(e) => setDirsearchConfig({...dirsearchConfig, random_agent: e.target.checked})}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                    />
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: isDark ? '#d1d5db' : '#111827' }}>Random User-Agent</span>
                  </label>
                </div>
              </div>
            )}

            {/* Nuclei Config */}
            {selectedTool === 'nuclei' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label>
                    Templates (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={nucleiConfig.templates.join(',')}
                    onChange={(e) => setNucleiConfig({...nucleiConfig, templates: e.target.value.split(',')})}
                    className="w-full border rounded-lg"
                    placeholder="cves/,vulnerabilities/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity Levels
                  </label>
                  <div className="flex gap-4">
                    {['critical', 'high', 'medium', 'low'].map(sev => (
                      <label key={sev} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={nucleiConfig.severity.includes(sev)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNucleiConfig({...nucleiConfig, severity: [...nucleiConfig.severity, sev]});
                            } else {
                              setNucleiConfig({...nucleiConfig, severity: nucleiConfig.severity.filter(s => s !== sev)});
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                        />
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: isDark ? '#d1d5db' : '#111827' }} className="capitalize">{sev}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3" style={{ gap: '20px' }}>
                  <div>
                    <label>
                      Threads
                    </label>
                    <input
                      type="number"
                      value={nucleiConfig.threads}
                      onChange={(e) => setNucleiConfig({...nucleiConfig, threads: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                  <div>
                    <label>
                      Rate Limit
                    </label>
                    <input
                      type="number"
                      value={nucleiConfig.rate_limit}
                      onChange={(e) => setNucleiConfig({...nucleiConfig, rate_limit: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                  <div>
                    <label>
                      Timeout (s)
                    </label>
                    <input
                      type="number"
                      value={nucleiConfig.timeout}
                      onChange={(e) => setNucleiConfig({...nucleiConfig, timeout: Number(e.target.value)})}
                      className="w-full border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t flex justify-end space-x-4" style={{
          padding: '14px 28px',
          backgroundColor: isDark ? '#111827' : '#f9fafb',
          borderColor: isDark ? '#374151' : '#e5e7eb'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="border rounded-lg transition-colors"
            style={{
              borderColor: isDark ? '#4b5563' : '#d1d5db',
              color: isDark ? '#d1d5db' : '#374151',
              backgroundColor: 'transparent',
              fontSize: '15px',
              lineHeight: '1.5',
              padding: '10px 24px',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1f2937' : '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedTargetId}
            className="rounded-lg transition-colors"
            style={{
              backgroundColor: selectedTargetId ? '#2563eb' : '#9ca3af',
              color: '#ffffff',
              cursor: selectedTargetId ? 'pointer' : 'not-allowed',
              fontSize: '15px',
              lineHeight: '1.5',
              padding: '10px 28px',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => { if (selectedTargetId) e.currentTarget.style.backgroundColor = '#1d4ed8' }}
            onMouseLeave={(e) => { if (selectedTargetId) e.currentTarget.style.backgroundColor = '#2563eb' }}
          >
            Start Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScanModal;
