import React, { useState, useEffect } from 'react';
import { targetAPI, CreateTargetRequest, Target } from '../../services/targetAPI';

interface AddTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetData: Target) => void;
  parentWildcardId?: number | null;
}

const AddTargetModal: React.FC<AddTargetModalProps> = ({ isOpen, onClose, onSubmit, parentWildcardId }) => {
  const [isWildcard, setIsWildcard] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    port: '',
    wildcardPattern: '',
    parentWildcard: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wildcardTargets, setWildcardTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentWildcardPattern, setParentWildcardPattern] = useState<string>('');

  // Load wildcard targets when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWildcardTargets();
    }
  }, [isOpen]);

  // Set parent wildcard when parentWildcardId is provided
  useEffect(() => {
    if (parentWildcardId && wildcardTargets.length > 0) {
      const parentTarget = wildcardTargets.find(t => t.id === parentWildcardId);
      if (parentTarget?.wildcardPattern) {
        setParentWildcardPattern(parentTarget.wildcardPattern);
        setFormData(prev => ({
          ...prev,
          parentWildcard: parentWildcardId.toString()
        }));
      }
      setIsWildcard(false); // Child targets cannot be wildcards
    } else {
      setParentWildcardPattern('');
      setFormData(prev => ({
        ...prev,
        parentWildcard: ''
      }));
    }
  }, [parentWildcardId, wildcardTargets]);

  const loadWildcardTargets = async () => {
    try {
      setIsLoading(true);
      const targets = await targetAPI.getWildcardTargets();
      setWildcardTargets(targets);
    } catch (error) {
      console.error('Failed to load wildcard targets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract domain suffix from wildcard pattern
  const getDomainSuffix = (wildcardPattern: string): string => {
    // Convert *.example.com to .example.com
    return wildcardPattern.replace(/^\*/, '');
  };

  // Helper function to build full domain from subdomain input
  const buildFullDomain = (subdomain: string, suffix: string): string => {
    return subdomain.trim() + suffix;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name is now optional - no validation needed

    if (!isWildcard) {
      if (!formData.domain.trim()) {
        newErrors.domain = 'Domain is required for regular targets';
      }
    } else {
      if (!formData.wildcardPattern.trim()) {
        newErrors.wildcardPattern = 'Wildcard pattern is required for wildcard targets';
      }
    }

    if (formData.port && (isNaN(Number(formData.port)) || Number(formData.port) < 1 || Number(formData.port) > 65535)) {
      newErrors.port = 'Port must be a number between 1 and 65535';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Build full domain if adding to wildcard parent
      let finalDomain = formData.domain;
      if (!isWildcard && parentWildcardPattern && formData.domain) {
        const suffix = getDomainSuffix(parentWildcardPattern);
        finalDomain = buildFullDomain(formData.domain, suffix);
      }

      const targetData: CreateTargetRequest = {
        name: formData.name,
        domain: isWildcard ? undefined : finalDomain || undefined,
        port: formData.port || undefined,
        wildcardPattern: isWildcard ? formData.wildcardPattern || undefined : undefined,
        parentWildcard: parentWildcardId ? parentWildcardId.toString() : (formData.parentWildcard || undefined),
        description: formData.description || undefined,
        isWildcard
      };

      const newTarget = await targetAPI.createTarget(targetData);
      onSubmit(newTarget);
      
      // Reset form
      setFormData({
        name: '',
        domain: '',
        port: '',
        wildcardPattern: '',
        parentWildcard: '',
        description: ''
      });
      setIsWildcard(false);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create target:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create target'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      domain: '',
      port: '',
      wildcardPattern: '',
      parentWildcard: '',
      description: ''
    });
    setIsWildcard(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Target</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new target for security scanning</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Regular Target */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !isWildcard 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setIsWildcard(false)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="targetType"
                  checked={!isWildcard}
                  onChange={() => setIsWildcard(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Regular Target</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Single domain or IP address</p>
                </div>
              </div>
            </div>

            {/* Wildcard Target */}
            <div 
              className={`p-4 border-2 rounded-lg transition-all ${
                parentWildcardId 
                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed' 
                  : isWildcard 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 cursor-pointer' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer'
              }`}
              onClick={() => !parentWildcardId && setIsWildcard(true)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="targetType"
                  checked={isWildcard}
                  onChange={() => setIsWildcard(true)}
                  disabled={!!parentWildcardId}
                  className="w-4 h-4 text-blue-600 disabled:opacity-50"
                />
                <div>
                  <h3 className={`font-medium ${parentWildcardId ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    Wildcard Target
                  </h3>
                  <p className={`text-sm ${parentWildcardId ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {parentWildcardId ? 'Cannot create wildcard as child of another wildcard' : 'Pattern to group subdomains'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
            
            {/* Target Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Name (Optional)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Leave blank to auto-generate from domain"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If empty, will use domain/wildcard pattern as name
              </p>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Target Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Target Configuration</h3>
            
            {isWildcard ? (
              /* Wildcard Pattern */
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wildcard Pattern <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wildcardPattern"
                  value={formData.wildcardPattern}
                  onChange={handleInputChange}
                  required={isWildcard}
                  placeholder="*.example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    ${errors.wildcardPattern ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.wildcardPattern ? (
                  <p className="text-xs text-red-500 mt-1">{errors.wildcardPattern}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use * as wildcard. Example: *.example.com will match sub1.example.com, sub2.example.com, etc.
                  </p>
                )}
              </div>
            ) : (
              /* Regular Target Fields */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {parentWildcardPattern ? 'Subdomain' : 'Domain/IP Address'} <span className="text-red-500">*</span>
                    </label>
                    {parentWildcardPattern ? (
                      <div className="relative">
                        <input
                          type="text"
                          name="domain"
                          value={formData.domain}
                          onChange={handleInputChange}
                          required={!isWildcard}
                          placeholder="sub1"
                          className={`w-full px-4 py-3 pr-32 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            ${errors.domain ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                          {getDomainSuffix(parentWildcardPattern)}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        required={!isWildcard}
                        placeholder="example.com or 192.168.1.1"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          ${errors.domain ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                    )}
                    {parentWildcardPattern && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Full domain will be: {formData.domain ? buildFullDomain(formData.domain, getDomainSuffix(parentWildcardPattern)) : `[subdomain]${getDomainSuffix(parentWildcardPattern)}`}
                      </p>
                    )}
                    {errors.domain && (
                      <p className="text-xs text-red-500 mt-1">{errors.domain}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port
                    </label>
                    <input
                      type="text"
                      name="port"
                      value={formData.port}
                      onChange={handleInputChange}
                      placeholder="80, 443, 8080"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        ${errors.port ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.port && (
                      <p className="text-xs text-red-500 mt-1">{errors.port}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Parent Wildcard Selection or Info */}
            {!isWildcard && (
              <div>
                {parentWildcardId ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Adding to Wildcard Target
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This target will be created as a child of the selected wildcard pattern.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parent Wildcard (Optional)
                    </label>
                    <select
                      name="parentWildcard"
                      value={formData.parentWildcard}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 
                        disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      <option value="">None - Standalone target</option>
                      {wildcardTargets.map(target => (
                        <option key={target.id} value={target.id}>
                          {target.wildcardPattern} - {target.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Group this target under a wildcard pattern for better organization
                    </p>
                    {errors.parentWildcard && (
                      <p className="text-xs text-red-500 mt-1">{errors.parentWildcard}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Optional description for this target..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                  hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors 
                  disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors 
                  flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Target</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTargetModal;