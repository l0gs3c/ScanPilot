import React, { useState, useEffect } from 'react';
import AddTargetModal from '../components/modals/AddTargetModal';
import { targetAPI, Target, TargetListResponse } from '../services/targetAPI';

const TargetsPage: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedTargets, setExpandedTargets] = useState<Set<number>>(new Set());
  const [subTargets, setSubTargets] = useState<Map<number, Target[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWildcardId, setSelectedWildcardId] = useState<number | null>(null);

  // Load targets from API
  useEffect(() => {
    loadTargets();
  }, [searchTerm, filterStatus]);

  const loadTargets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await targetAPI.getTargets({
        search: searchTerm || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus,
        limit: 100
      });
      setTargets(response.targets);
    } catch (err) {
      console.error('Failed to load targets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load targets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTarget = (targetData: Target) => {
    if (selectedWildcardId) {
      // If adding to a wildcard, reload its children and ensure it's expanded
      loadSubTargets(selectedWildcardId);
      setExpandedTargets(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedWildcardId);
        return newSet;
      });
      setSelectedWildcardId(null);
    } else {
      // Adding a root level target
      setTargets(prev => [...prev, targetData]);
    }
    console.log('New target created:', targetData);
  };

  const handleAddToWildcard = (wildcardId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering expand/collapse
    setSelectedWildcardId(wildcardId);
    setIsAddModalOpen(true);
  };

  const toggleTargetExpansion = async (targetId: number, isWildcard: boolean) => {
    if (!isWildcard) return; // Only wildcard targets can be expanded
    
    setExpandedTargets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(targetId)) {
        newSet.delete(targetId);
      } else {
        newSet.add(targetId);
        // Load sub-targets when expanding
        loadSubTargets(targetId);
      }
      return newSet;
    });
  };

  const loadSubTargets = async (wildcardTargetId: number) => {
    try {
      const response = await targetAPI.getTargetChildren(wildcardTargetId);
      setSubTargets(prev => {
        const newMap = new Map(prev);
        newMap.set(wildcardTargetId, response.targets);
        return newMap;
      });
    } catch (err) {
      console.error('Failed to load sub-targets:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanning':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case 'completed':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scanning':
        return 'Scanning';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  // Since filtering is now done on the server, just use targets directly
  const filteredTargets = targets;

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Targets</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your scanning targets and domains</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Target</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All</option>
              <option value="idle">Idle</option>
              <option value="scanning">Scanning</option>
              <option value="completed">Completed</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Error loading targets</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadTargets}
            className="mt-2 text-red-700 hover:text-red-800 font-medium text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Targets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-8 h-8 mx-auto mb-4 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Loading targets...</p>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No targets found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first target</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Target</span>
            </button>
          </div>
        ) : (
          filteredTargets.map(target => (
            <div key={target.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Target Header */}
              <div
                className={`p-6 transition-colors ${target.isWildcard ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
                onClick={() => target.isWildcard && toggleTargetExpansion(target.id, target.isWildcard)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(target.status)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{target.name}</h3>
                        {target.isWildcard && (
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                            Wildcard
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {target.isWildcard ? target.wildcardPattern : `${target.domain}${target.port ? ':' + target.port : ''}`}
                      </span>
                      <span>•</span>
                      <span>{getStatusText(target.status)}</span>
                      <span>•</span>
                      {target.isWildcard && target.childrenCount !== undefined ? (
                        <span>{target.childrenCount} sub-targets</span>
                      ) : (
                        <span>{target.activeScans} active, {target.completedScans} completed</span>
                      )}
                    </div>
                    
                    {target.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{target.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {!target.isWildcard && (
                      <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>New Scan</span>
                      </button>
                    )}
                    
                    {target.isWildcard && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleAddToWildcard(target.id, e)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Target</span>
                        </button>
                        <svg
                          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
                            expandedTargets.has(target.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTargets.has(target.id) && target.isWildcard && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  {subTargets.get(target.id)?.length ? (
                    <div className="space-y-3">
                      {subTargets.get(target.id)?.map(subTarget => (
                        <div key={subTarget.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(subTarget.status)}
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">{subTarget.name}</h5>
                              </div>
                              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                                <span>{subTarget.domain}{subTarget.port ? ':' + subTarget.port : ''}</span>
                                <span>•</span>
                                <span>{getStatusText(subTarget.status)}</span>
                                <span>•</span>
                                <span>{subTarget.activeScans} active, {subTarget.completedScans} completed</span>
                              </div>
                              {subTarget.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subTarget.description}</p>
                              )}
                            </div>
                            <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Scan</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                      No sub-targets found for this wildcard pattern.
                      <br />
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-2"
                      >
                        Add a sub-target
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Scan History for regular targets */}
              {expandedTargets.has(target.id) && !target.isWildcard && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Scan History</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                    No scan history available for this target yet.
                    <br />
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-2">
                      Start your first scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Target Modal */}
      <AddTargetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedWildcardId(null);
        }}
        onSubmit={handleAddTarget}
        parentWildcardId={selectedWildcardId}
      />
    </div>
  );
};

export default TargetsPage;