import React, { useEffect, useRef, useState } from 'react';

interface TerminalProps {
  scanId: string;
  wsUrl?: string;
}

interface TerminalMessage {
  type: 'status' | 'output' | 'error' | 'connected' | 'completed';
  message?: string;
  data?: string;
  status?: string;
  command?: string;
  output_file?: string;
}

const Terminal: React.FC<TerminalProps> = ({ scanId, wsUrl }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('connecting');
  const [autoScroll, setAutoScroll] = useState(true);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!scanId) return;

    // Construct WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = wsUrl || `${window.location.hostname}:8000`;
    const url = `${protocol}//${host}/ws/scans/${scanId}`;

    console.log('Connecting to WebSocket:', url);
    setOutput(prev => [...prev, `[INFO] Connecting to scan stream...`]);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      setOutput(prev => [...prev, `[INFO] Connected to scan ${scanId}`]);
    };

    ws.onmessage = (event) => {
      try {
        const message: TerminalMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connected':
            setOutput(prev => [
              ...prev,
              `[INFO] Connected. Waiting for scan to start...`
            ]);
            setStatus('connected');
            break;
            
          case 'status':
            if (message.message) {
              setOutput(prev => [...prev, `[STATUS] ${message.message}`]);
            }
            if (message.command) {
              setOutput(prev => [...prev, `[CMD] ${message.command}`]);
            }
            if (message.status) {
              setStatus(message.status);
            }
            break;
            
          case 'output':
            if (message.data !== undefined) {
              setOutput(prev => [...prev, message.data as string]);
            }
            break;
            
          case 'error':
            if (message.message) {
              setOutput(prev => [...prev, `[ERROR] ${message.message}`]);
            }
            setStatus('error');
            break;
            
          case 'completed':
            setOutput(prev => [
              ...prev,
              `[INFO] Scan completed`,
              message.output_file ? `[INFO] Results saved to: ${message.output_file}` : ''
            ].filter(Boolean));
            setStatus('completed');
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setOutput(prev => [...prev, event.data]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setOutput(prev => [...prev, '[ERROR] WebSocket connection error']);
      setStatus('error');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setOutput(prev => [...prev, '[INFO] Connection closed']);
      setStatus('disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [scanId, wsUrl]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, autoScroll]);

  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
      case 'running':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
      case 'running':
        return (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const downloadOutput = () => {
    const content = output.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_${scanId}_output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div className="terminal-container bg-gray-900 dark:bg-black rounded-lg border border-gray-700 dark:border-gray-800 overflow-hidden">
      {/* Terminal Header */}
      <div className="terminal-header bg-gray-800 dark:bg-gray-950 px-4 py-2 flex items-center justify-between border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className={`flex items-center space-x-2 ml-4 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center text-gray-400 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 mr-2"
            />
            Auto-scroll
          </label>
          <button
            onClick={clearOutput}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            title="Clear output"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={downloadOutput}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            title="Download output"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="terminal-output font-mono text-sm p-4 h-[500px] overflow-y-auto bg-gray-900 dark:bg-black">
        {output.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Waiting for output...
          </div>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => {
              let className = 'text-green-400';
              
              if (line.startsWith('[ERROR]')) {
                className = 'text-red-400';
              } else if (line.startsWith('[WARN]') || line.startsWith('[STATUS]')) {
                className = 'text-yellow-400';
              } else if (line.startsWith('[INFO]')) {
                className = 'text-blue-400';
              } else if (line.startsWith('[CMD]')) {
                className = 'text-purple-400';
              }
              
              return (
                <div key={index} className={className}>
                  {line}
                </div>
              );
            })}
            <div ref={outputEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
