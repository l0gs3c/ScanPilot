import React, { useState, useEffect } from 'react';
import { Target } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useConfirmation } from '../../hooks/useConfirmation';
import Toast from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

// Tool configuration interfaces
interface ToolConfig {
  [key: string]: any;
}

interface ScanTemplate {
  id: number;
  name: string;
  description?: string;
  tool: string;
  command_template: string;
  created_at: string;
  updated_at?: string;
}

interface SubfinderConfig extends ToolConfig {
  domain: string;
  outputFile?: string;
  resolvers?: string;
  threads?: number;
  timeout?: number;
  rateLimit?: number;
  silent?: boolean;
  active?: boolean;
  wordlist?: string;
  outputFormat?: string;
  exclude?: string[];
}

interface DirsearchConfig extends ToolConfig {
  url: string;
  command?: string;
  extensions?: string[];
  wordlist?: string;
  threads?: number;
  timeout?: number;
  excludeStatus?: number[];
  includeStatus?: number[];
  delay?: number;
  randomUserAgent?: boolean;
  recursive?: boolean;
  excludeDirectories?: string[];
}

interface NucleiConfig extends ToolConfig {
  target: string;
  command?: string;
  templates?: string[];
  severity?: string[];
  tags?: string[];
  author?: string[];
  exclude?: string[];
  outputFile?: string;
  threads?: number;
  rateLimit?: number;
  timeout?: number;
  bulkSize?: number;
  templateTimeout?: number;
  concurrency?: number;
  verbose?: boolean;
}

export interface ScanData {
  name: string;
  targetId: number;
  tool: 'subfinder' | 'dirsearch' | 'nuclei';
  config: ToolConfig;
}

interface AddScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scanData: ScanData) => void;
}

const AddScanModal: React.FC<AddScanModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { token } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { confirmation, confirmDelete } = useConfirmation();
  const [targets, setTargets] = useState<Target[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<Target[]>([]);
  const [selectedTool, setSelectedTool] = useState<'subfinder' | 'dirsearch' | 'nuclei'>('subfinder');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [targetSearch, setTargetSearch] = useState('');
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Template management state
  const [templates, setTemplates] = useState<ScanTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showSaveTemplate, setShowSaveTemplate] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');

  // Tool-specific configurations
  const [subfinderConfig, setSubfinderConfig] = useState<SubfinderConfig>({
    domain: '',
    threads: undefined,
    timeout: undefined,
    rateLimit: undefined,
    silent: false,
    active: false,
    wordlist: '',
    outputFormat: 'txt',
    exclude: []
  });

  const [dirsearchConfig, setDirsearchConfig] = useState<DirsearchConfig>({
    url: '',
    command: '',
    extensions: ['php', 'html', 'js', 'txt', 'jsp', 'asp', 'aspx'],
    threads: 10,
    timeout: 30,
    excludeStatus: [404, 403],
    delay: 0,
    randomUserAgent: true,
    recursive: false,
    excludeDirectories: []
  });

  const [nucleiConfig, setNucleiConfig] = useState<NucleiConfig>({
    target: '',
    command: '',
    severity: ['critical', 'high', 'medium'],
    concurrency: 25,
    rateLimit: 150,
    timeout: 5,
    verbose: false
  });

  // Template management functions
  const loadTemplates = async () => {
    try {
      if (!token) return;

      const response = await fetch('/api/v1/templates/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const templates = await response.json();
        setTemplates(templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) return;

    try {
      console.log('Save template - Token:', token ? 'exists' : 'null');
      console.log('Template name:', templateName);
      console.log('Selected tool:', selectedTool);
      
      if (!token) {
        showError('Please login to save templates');
        return;
      }

      // Get current command and replace domain/URL with placeholder
      let commandTemplate = '';
      const selectedTarget = targets.find(t => t.id === selectedTargetId);
      
      if (selectedTool === 'subfinder') {
        commandTemplate = subfinderConfig.domain || '';
        // Replace actual domain with placeholder
        if (selectedTarget) {
          commandTemplate = commandTemplate.replace(selectedTarget.domain, '{DOMAIN}');
        }
      } else if (selectedTool === 'dirsearch') {
        commandTemplate = dirsearchConfig.command || '';
        // Replace actual URL with placeholder
        if (selectedTarget) {
          const protocol = selectedTarget.port === 443 ? 'https' : 'http';
          const portStr = selectedTarget.port && selectedTarget.port !== 80 && selectedTarget.port !== 443 ? `:${selectedTarget.port}` : '';
          const fullUrl = `${protocol}://${selectedTarget.domain}${portStr}`;
          commandTemplate = commandTemplate.replace(fullUrl, '{URL}');
        }
      } else if (selectedTool === 'nuclei') {
        commandTemplate = nucleiConfig.command || '';
        // Replace actual URL with placeholder
        if (selectedTarget) {
          const protocol = selectedTarget.port === 443 ? 'https' : 'http';
          const portStr = selectedTarget.port && selectedTarget.port !== 80 && selectedTarget.port !== 443 ? `:${selectedTarget.port}` : '';
          const fullUrl = `${protocol}://${selectedTarget.domain}${portStr}`;
          commandTemplate = commandTemplate.replace(fullUrl, '{URL}');
        }
      }

      const templateData = {
        name: templateName.trim(),
        tool: selectedTool,
        command_template: commandTemplate,
        description: templateDescription.trim() || null
      };

      const response = await fetch('/api/v1/templates/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        showSuccess('Template saved successfully!');
        loadTemplates(); // Reload templates
        setShowSaveTemplate(false);
        setTemplateName('');
        setTemplateDescription('');
      } else {
        const error = await response.json();
        showError(`Error saving template: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showError('Error saving template');
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      if (!token) return;

      const response = await fetch(`/api/v1/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const template = await response.json();
        setSelectedTool(template.tool as 'subfinder' | 'dirsearch' | 'nuclei');
        
        // Apply template and replace placeholders with current target
        const selectedTarget = targets.find(t => t.id === selectedTargetId);
        if (selectedTarget && template.command_template) {
          let command = template.command_template;
          
          // Replace placeholders with actual values
          command = command.replace(/{DOMAIN}/g, selectedTarget.domain);
          
          const protocol = selectedTarget.port === 443 ? 'https' : 'http';
          const portStr = selectedTarget.port && selectedTarget.port !== 80 && selectedTarget.port !== 443 ? `:${selectedTarget.port}` : '';
          const fullUrl = `${protocol}://${selectedTarget.domain}${portStr}`;
          command = command.replace(/{URL}/g, fullUrl);

          // Update the appropriate config
          if (template.tool === 'subfinder') {
            setSubfinderConfig(prev => ({ ...prev, domain: command }));
          } else if (template.tool === 'dirsearch') {
            setDirsearchConfig(prev => ({ ...prev, command: command }));
          } else if (template.tool === 'nuclei') {
            setNucleiConfig(prev => ({ ...prev, command: command }));
          }
        }
        
        setSelectedTemplateId(templateId);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    const templateName = template?.name || 'this template';
    
    confirmDelete(templateName, async () => {
      try {
        if (!token) return;

      const response = await fetch(`/api/v1/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

        if (response.ok) {
          showSuccess('Template deleted successfully!');
          loadTemplates(); // Reload templates
          if (selectedTemplateId === templateId) {
            setSelectedTemplateId('');
          }
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    });
  };

  const getCurrentToolConfig = () => {
    switch (selectedTool) {
      case 'subfinder': return subfinderConfig;
      case 'dirsearch': return dirsearchConfig;
      case 'nuclei': return nucleiConfig;
      default: return subfinderConfig;
    }
  };

  const setCurrentToolConfig = (config: any) => {
    switch (selectedTool) {
      case 'subfinder': 
        setSubfinderConfig(config as SubfinderConfig);
        break;
      case 'dirsearch': 
        setDirsearchConfig(config as DirsearchConfig);
        break;
      case 'nuclei': 
        setNucleiConfig(config as NucleiConfig);
        break;
    }
  };

  // Load targets from API (excluding wildcards)
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, loading targets...');
      loadTargets();
      loadTemplates(); // Load templates when modal opens
    }
  }, [isOpen]);

  // Filter targets based on search
  useEffect(() => {
    if (!targetSearch.trim()) {
      setFilteredTargets(targets);
    } else {
      const filtered = targets.filter(target =>
        target.domain.toLowerCase().includes(targetSearch.toLowerCase()) ||
        (target.name && target.name.toLowerCase().includes(targetSearch.toLowerCase()))
      );
      setFilteredTargets(filtered);
    }
  }, [targetSearch, targets]);

  // Update tool configurations when target or tool changes
  useEffect(() => {
    if (selectedTargetId && selectedTool) {
      const target = targets.find(t => t.id === selectedTargetId);
      if (target) {
        // Update tool configurations with target information
        if (selectedTool === 'subfinder') {
          const newCommand = generateSubfinderCommand(subfinderConfig, target.domain);
          setSubfinderConfig(prev => ({ 
            ...prev, 
            domain: newCommand
          }));
        } else if (selectedTool === 'dirsearch') {
          const protocol = target.port === 443 ? 'https' : 'http';
          const portStr = target.port && target.port !== 80 && target.port !== 443 ? `:${target.port}` : '';
          const targetUrl = `${protocol}://${target.domain}${portStr}`;
          const newCommand = generateDirsearchCommand(dirsearchConfig, targetUrl);
          setDirsearchConfig(prev => ({ ...prev, url: targetUrl, command: newCommand }));
        } else if (selectedTool === 'nuclei') {
          const protocol = target.port === 443 ? 'https' : 'http';
          const portStr = target.port && target.port !== 80 && target.port !== 443 ? `:${target.port}` : '';
          const targetUrl = `${protocol}://${target.domain}${portStr}`;
          const newCommand = generateNucleiCommand(nucleiConfig, targetUrl);
          setNucleiConfig(prev => ({ ...prev, target: targetUrl, command: newCommand }));
        }
      }
    }
  }, [selectedTargetId, selectedTool, targets]);

  // Generate commands based on configuration
  const generateDirsearchCommand = (config: DirsearchConfig, targetUrl: string) => {
    let command = `dirsearch -u ${targetUrl}`;
    
    // Add output file
    const urlObj = new URL(targetUrl);
    const domain = urlObj.hostname;
    command += ` -o ./results/dirsearch/${domain}_dirsearch.txt`;
    
    // Add extensions
    if (config.extensions && config.extensions.length > 0) {
      command += ` -e ${config.extensions.join(',')}`;
    }
    
    // Add threads (only if defined and not default)
    if (config.threads !== undefined && config.threads !== 10) {
      command += ` -t ${config.threads}`;
    }
    
    // Add delay (only if defined and not default)  
    if (config.delay !== undefined && config.delay !== 0) {
      command += ` --delay ${config.delay}`;
    }
    
    // Add wordlist
    if (config.wordlist) {
      command += ` -w ${config.wordlist}`;
    }
    
    // Add exclude status codes
    if (config.excludeStatus && config.excludeStatus.length > 0) {
      command += ` -x ${config.excludeStatus.join(',')}`;
    }
    
    return command;
  };

  const generateNucleiCommand = (config: NucleiConfig, targetUrl: string) => {
    let command = `nuclei -u ${targetUrl}`;
    
    // Add output file
    const urlObj = new URL(targetUrl);
    const domain = urlObj.hostname;
    command += ` -o ./results/nuclei/${domain}_nuclei.txt`;
    
    // Add templates
    if (config.templates && config.templates.length > 0) {
      command += ` -t ${config.templates.join(',')}`;
    }
    
    // Add severity filter
    if (config.severity && config.severity.length > 0) {
      command += ` -s ${config.severity.join(',')}`;
    }
    
    // Add concurrency (only if defined and not default)
    if (config.concurrency !== undefined && config.concurrency !== 25) {
      command += ` -c ${config.concurrency}`;
    }
    
    // Add rate limit (only if defined and not default)
    if (config.rateLimit !== undefined && config.rateLimit !== 150) {
      command += ` -rl ${config.rateLimit}`;
    }
    
    // Add flags
    if (config.verbose) {
      command += ` -v`;
    }
    
    return command;
  };

  const generateSubfinderCommand = (config: SubfinderConfig, targetDomain: string) => {
    let command;
    
    // Check if using wordlist or single domain
    if (config.wordlist && config.wordlist.trim() && config.wordlist !== 'default') {
      command = `subfinder -dL ./wordlist/${config.wordlist}`;
    } else {
      command = `subfinder -d ${targetDomain}`;
    }
    
    // Add output file
    command += ` -o ./results/subfinder/${targetDomain}_subdomains.txt`;
    
    // Add threads (only if defined and not default)
    if (config.threads !== undefined && config.threads !== 10) {
      command += ` -t ${config.threads}`;
    }
    
    // Add timeout (only if defined and not default)
    if (config.timeout !== undefined && config.timeout !== 30) {
      command += ` -timeout ${config.timeout}`;
    }
    
    // Add rate limit (only if defined and not default)
    if (config.rateLimit !== undefined && config.rateLimit !== 150) {
      command += ` -rl ${config.rateLimit}`;
    }
    
    // Add flags
    if (config.silent) {
      command += ` -silent`;
    }
    
    if (config.active) {
      command += ` -nW`;
    }
    
    // Add JSON output format
    if (config.outputFormat === 'json') {
      command += ` -oJ`;
    }
    
    return command;
  };

  // Update command when config changes (excluding domain field to avoid infinite loop)
  useEffect(() => {
    if (selectedTargetId && selectedTool === 'subfinder') {
      const target = targets.find(t => t.id === selectedTargetId);
      if (target) {
        const newCommand = generateSubfinderCommand(subfinderConfig, target.domain);
        // Only update if command is different to avoid infinite loop
        if (subfinderConfig.domain !== newCommand) {
          setSubfinderConfig(prev => ({ ...prev, domain: newCommand }));
        }
      }
    } else if (selectedTargetId && selectedTool === 'dirsearch') {
      const target = targets.find(t => t.id === selectedTargetId);
      if (target && dirsearchConfig.url) {
        const newCommand = generateDirsearchCommand(dirsearchConfig, dirsearchConfig.url);
        // Only update if command is different to avoid infinite loop
        if (dirsearchConfig.command !== newCommand) {
          setDirsearchConfig(prev => ({ ...prev, command: newCommand }));
        }
      }
    } else if (selectedTargetId && selectedTool === 'nuclei') {
      const target = targets.find(t => t.id === selectedTargetId);
      if (target && nucleiConfig.target) {
        const newCommand = generateNucleiCommand(nucleiConfig, nucleiConfig.target);
        // Only update if command is different to avoid infinite loop
        if (nucleiConfig.command !== newCommand) {
          setNucleiConfig(prev => ({ ...prev, command: newCommand }));
        }
      }
    }
  }, [subfinderConfig.threads, subfinderConfig.timeout, subfinderConfig.rateLimit, 
      subfinderConfig.silent, subfinderConfig.active, subfinderConfig.wordlist,
      subfinderConfig.outputFormat, 
      dirsearchConfig.extensions, dirsearchConfig.threads, dirsearchConfig.delay,
      dirsearchConfig.wordlist, dirsearchConfig.excludeStatus, dirsearchConfig.url,
      nucleiConfig.templates, nucleiConfig.severity, nucleiConfig.concurrency, 
      nucleiConfig.rateLimit, nucleiConfig.verbose, nucleiConfig.target,
      selectedTargetId, selectedTool, targets]);

  const loadTargets = async () => {
    try {
      setIsLoading(true);
      
      // Get token from AuthContext
      console.log('Token from AuthContext:', token ? 'exists' : 'null');
      
      if (!token) {
        console.error('No token found in localStorage');
        throw new Error('No authentication token found');
      }
      
      // API call to get scannable targets from database (including sub-targets)
      const response = await fetch('http://localhost:8000/api/v1/targets/scannable', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        console.error('Authentication failed - token may be expired');
        // Redirect to login if token is invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      
      // Handle different response formats
      let targetsArray = [];
      if (Array.isArray(data)) {
        targetsArray = data;
      } else if (data && data.targets && Array.isArray(data.targets)) {
        targetsArray = data.targets;
      } else if (data && typeof data === 'object') {
        console.log('Response keys:', Object.keys(data));
        targetsArray = [];
      }
      
      console.log('Targets array:', targetsArray);
      console.log('Targets count:', targetsArray.length);
      
      // Temporarily show ALL targets for debugging
      console.log('All targets before filtering:', targetsArray.map((t: any) => ({
        id: t.id,
        name: t.name,
        domain: t.domain,
        isWildcard: t.isWildcard
      })));
      
      // Filter out wildcards - only show regular targets for scanning
      const nonWildcardTargets = targetsArray.filter((target: any) => {
        console.log(`Target ${target.name}: isWildcard = ${target.isWildcard}`);
        return !target.isWildcard;
      });
      console.log('Non-wildcard targets:', nonWildcardTargets);
      
      // TEMPORARY: Show all targets for debugging
      setTargets(targetsArray);
      setFilteredTargets(targetsArray);
      
      console.log('Loaded targets from database:', nonWildcardTargets);
    } catch (error) {
      console.error('Failed to load targets from API:', error);
      
      // Fallback mock data if API fails
      const mockTargets: Target[] = [
        {
          id: 1,
          name: 'example.com (fallback)',
          domain: 'example.com',
          port: null,
          isWildcard: false,
          wildcardPattern: null,
          parentWildcard: null,
          status: 'active',
          scanCount: 0,
          lastScanAt: null,
          createdAt: '2024-11-02T10:00:00Z',
          updatedAt: '2024-11-02T10:00:00Z'
        }
      ];
      
      const nonWildcardTargets = mockTargets.filter(target => !target.isWildcard);
      setTargets(nonWildcardTargets);
      setFilteredTargets(nonWildcardTargets);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    const target = targets.find(t => t.id === selectedTargetId);
    if (!target) return;

    let config: ToolConfig;
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
      default:
        return;
    }

    // Auto-generate scan name
    const toolName = selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1);
    const scanName = `${toolName} Scan - ${target.domain}`;

    const scanData: ScanData = {
      name: scanName,
      targetId: selectedTargetId,
      tool: selectedTool,
      config
    };

    onSubmit(scanData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTargetId(null);
    setSelectedTool('subfinder');
    setTargetSearch('');
    setShowTargetDropdown(false);
    onClose();
  };

  const handleTargetSelect = (target: Target) => {
    setSelectedTargetId(target.id);
    setTargetSearch(target.domain);
    setShowTargetDropdown(false);
  };

  const getSelectedTarget = () => {
    return targets.find(t => t.id === selectedTargetId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.target-select-container')) {
        setShowTargetDropdown(false);
      }
    };

    if (showTargetDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTargetDropdown]);

  if (!isOpen) return null;

  const renderToolConfiguration = () => {
    switch (selectedTool) {
      case 'subfinder':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Command
              </label>
              <input
                type="text"
                value={subfinderConfig.domain}
                onChange={(e) => setSubfinderConfig(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="subfinder -d example.com -o output.txt"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title="Number of concurrent threads for faster scanning">
                  Threads
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={subfinderConfig.threads || ''}
                  onChange={(e) => setSubfinderConfig(prev => ({ ...prev, threads: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title="Timeout in seconds for each DNS query">
                  Timeout (s)
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={subfinderConfig.timeout || ''}
                  onChange={(e) => setSubfinderConfig(prev => ({ ...prev, timeout: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title="Maximum requests per second to avoid rate limiting">
                  Rate Limit
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={subfinderConfig.rateLimit || ''}
                  onChange={(e) => setSubfinderConfig(prev => ({ ...prev, rateLimit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title="Use custom wordlist file for domain enumeration">
                  Wordlist
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </label>
                <select
                  value={subfinderConfig.wordlist || ''}
                  onChange={(e) => setSubfinderConfig(prev => ({ ...prev, wordlist: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Default</option>
                  <option value="common.txt">Common</option>
                  <option value="top1000.txt">Top 1000</option>
                  <option value="custom.txt">Custom</option>
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title="Choose output format for scan results">
                  Output Format
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </label>
                <select
                  value={subfinderConfig.outputFormat || 'txt'}
                  onChange={(e) => setSubfinderConfig(prev => ({ ...prev, outputFormat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="txt">Text (.txt)</option>
                  <option value="json">JSON (-oJ)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Options
              </label>
              <div className="flex gap-6">
                <label className="flex items-center" title="Run in silent mode with minimal output">
                  <input
                    type="checkbox"
                    checked={subfinderConfig.silent}
                    onChange={(e) => setSubfinderConfig(prev => ({ ...prev, silent: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Silent Mode</span>
                </label>
                <label className="flex items-center" title="Verify found subdomains by resolving them">
                  <input
                    type="checkbox"
                    checked={subfinderConfig.active || false}
                    onChange={(e) => setSubfinderConfig(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active Verification</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'dirsearch':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target URL
              </label>
              <input
                type="url"
                value={dirsearchConfig.url}
                onChange={(e) => setDirsearchConfig(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Command
              </label>
              <input
                type="text"
                value={dirsearchConfig.command || ''}
                onChange={(e) => setDirsearchConfig(prev => ({ ...prev, command: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="dirsearch -u https://example.com -o ./results/output.txt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Extensions (comma-separated)
              </label>
              <input
                type="text"
                value={dirsearchConfig.extensions?.join(', ') || ''}
                onChange={(e) => setDirsearchConfig(prev => ({ 
                  ...prev, 
                  extensions: e.target.value.split(',').map(ext => ext.trim()).filter(ext => ext) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="php, html, js, txt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Threads
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dirsearchConfig.threads}
                  onChange={(e) => setDirsearchConfig(prev => ({ ...prev, threads: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delay (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={dirsearchConfig.delay}
                  onChange={(e) => setDirsearchConfig(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dirsearchConfig.randomUserAgent}
                  onChange={(e) => setDirsearchConfig(prev => ({ ...prev, randomUserAgent: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Random User-Agent</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dirsearchConfig.recursive}
                  onChange={(e) => setDirsearchConfig(prev => ({ ...prev, recursive: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recursive scanning</span>
              </label>
            </div>
          </div>
        );

      case 'nuclei':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target URL
              </label>
              <input
                type="url"
                value={nucleiConfig.target}
                onChange={(e) => setNucleiConfig(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Command
              </label>
              <input
                type="text"
                value={nucleiConfig.command || ''}
                onChange={(e) => setNucleiConfig(prev => ({ ...prev, command: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="nuclei -u https://example.com -o ./results/output.txt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity Levels
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['info', 'low', 'medium', 'high', 'critical'].map(severity => (
                  <label key={severity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={nucleiConfig.severity?.includes(severity)}
                      onChange={(e) => {
                        const severities = nucleiConfig.severity || [];
                        if (e.target.checked) {
                          setNucleiConfig(prev => ({ ...prev, severity: [...severities, severity] }));
                        } else {
                          setNucleiConfig(prev => ({ ...prev, severity: severities.filter(s => s !== severity) }));
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Threads
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={nucleiConfig.threads}
                  onChange={(e) => setNucleiConfig(prev => ({ ...prev, threads: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={nucleiConfig.rateLimit}
                  onChange={(e) => setNucleiConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 150 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Scan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Configure and start a new security scan</p>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Target Selection */}
            <div className="relative target-select-container">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetSearch}
                  onChange={(e) => {
                    setTargetSearch(e.target.value);
                    setShowTargetDropdown(true);
                    if (!e.target.value) {
                      setSelectedTargetId(null);
                    }
                  }}
                  onFocus={() => setShowTargetDropdown(true)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder={isLoading ? 'Loading targets...' : 'Search and select a target...'}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('Refresh button clicked');
                    loadTargets();
                  }}
                  disabled={isLoading}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Refresh targets"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showTargetDropdown && !isLoading && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-xs text-yellow-800 dark:text-yellow-400">
                        Debug: {targets.length} total, {filteredTargets.length} filtered
                      </div>
                    )}
                    {filteredTargets.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        {targetSearch ? 'No targets found matching your search' : 'No targets available'}
                      </div>
                    ) : (
                      filteredTargets.map(target => (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => handleTargetSelect(target)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {target.domain}
                              </div>
                              {target.name && target.name !== target.domain && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {target.name}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {target.port && target.port !== 80 && target.port !== 443 && `Port ${target.port}`}
                              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                target.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {target.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {targets.length === 0 && !isLoading && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No targets available. Please create a target first.
                </p>
              )}
            </div>

            {/* Tool Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scanning Tool *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['subfinder', 'dirsearch', 'nuclei'] as const).map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setSelectedTool(tool)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedTool === tool
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium capitalize">{tool}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tool === 'subfinder' && 'Subdomain Discovery'}
                        {tool === 'dirsearch' && 'Directory Bruteforce'}
                        {tool === 'nuclei' && 'Vulnerability Scanning'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Configuration Templates
              </label>
              <div className="flex gap-3 mb-4">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    if (e.target.value) {
                      loadTemplate(e.target.value);
                    } else {
                      setSelectedTemplateId('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a template...</option>
                  {templates
                    .filter(t => t.tool === selectedTool)
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))
                  }
                </select>
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save Template
                </button>
                {selectedTemplateId && (
                  <button
                    type="button"
                    onClick={() => deleteTemplate(selectedTemplateId)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              {/* Selected template info */}
              {selectedTemplateId && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  {(() => {
                    const template = templates.find(t => t.id === selectedTemplateId);
                    return template ? (
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">{template.description}</div>
                        )}
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Created: {template.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Tool Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tool Configuration
              </label>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                {renderToolConfiguration()}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedTargetId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Scan'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Save Configuration Template
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Fast Subfinder Scan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Describe when to use this configuration..."
                  />
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tool: <span className="font-medium capitalize">{selectedTool}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                    setTemplateDescription('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
      />
    </div>
  );
};

export default AddScanModal;