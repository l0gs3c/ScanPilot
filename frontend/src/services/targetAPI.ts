import { API_BASE_URL } from '../config/api';
import { makeAuthenticatedRequest } from '../utils/auth';

export interface Target {
  id: number;
  name: string;
  domain?: string;
  port?: string;
  wildcardPattern?: string;
  parentWildcard?: string;
  description?: string;
  isWildcard: boolean;
  status: 'idle' | 'scanning' | 'completed' | 'error';
  activeScans: number;
  completedScans: number;
  createdAt: string;
  updatedAt?: string;
  targetUrl?: string;
  childrenCount?: number;
}

export interface TargetListResponse {
  targets: Target[];
  total: number;
  page: number;
  size: number;
}

export interface CreateTargetRequest {
  name: string;
  domain?: string;
  port?: string;
  wildcardPattern?: string;
  parentWildcard?: string;
  description?: string;
  isWildcard: boolean;
}

export interface UpdateTargetRequest {
  name?: string;
  domain?: string;
  port?: string;
  wildcardPattern?: string;
  parentWildcard?: string;
  description?: string;
  status?: string;
}

export interface TargetFilters {
  skip?: number;
  limit?: number;
  status?: string;
  search?: string;
  order_by?: string;
  order_desc?: boolean;
}

class TargetAPI {

  async createTarget(targetData: CreateTargetRequest): Promise<Target> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/`, {
      method: 'POST',
      body: JSON.stringify(targetData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create target' }));
      throw new Error(error.detail || 'Failed to create target');
    }

    return response.json();
  }

  async getTargets(filters: TargetFilters = {}): Promise<TargetListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch targets');
    }

    return response.json();
  }

  async getTarget(id: number): Promise<Target> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Target not found');
      }
      throw new Error('Failed to fetch target');
    }

    return response.json();
  }

  async updateTarget(id: number, targetData: UpdateTargetRequest): Promise<Target> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(targetData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update target' }));
      throw new Error(error.detail || 'Failed to update target');
    }

    return response.json();
  }

  async deleteTarget(id: number): Promise<void> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete target' }));
      throw new Error(error.detail || 'Failed to delete target');
    }
  }

  async updateTargetStatus(id: number, status: string): Promise<void> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/${id}/status?status=${status}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update target status' }));
      throw new Error(error.detail || 'Failed to update target status');
    }
  }

  async getWildcardTargets(): Promise<Target[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/wildcards/list`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wildcard targets');
    }

    return response.json();
  }

  async getTargetChildren(targetId: number, filters: TargetFilters = {}): Promise<TargetListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/targets/${targetId}/children?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch target children');
    }

    return response.json();
  }
}

export const targetAPI = new TargetAPI();