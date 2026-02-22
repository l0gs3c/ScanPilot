import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export interface Target {
  id: number
  name: string
  domain?: string
  port?: string
  wildcardPattern?: string
  parentWildcard?: number
  description?: string
  isWildcard: boolean
  status: string
  activeScans: number
  completedScans: number
  createdAt: string
  updatedAt?: string
  targetUrl: string
}

export interface CreateTargetRequest {
  name: string
  domain?: string
  port?: string
  wildcardPattern?: string
  parentWildcard?: number
  description?: string
  isWildcard: boolean
}

export interface TargetFilters {
  skip?: number
  limit?: number
  status?: string
  search?: string
  order_by?: string
  order_desc?: boolean
}

export interface TargetsResponse {
  targets: Target[]
  total: number
  page: number
  size: number
}

export const targetAPI = {
  // Get all targets with filtering
  async getTargets(filters: TargetFilters = {}): Promise<TargetsResponse> {
    const params = new URLSearchParams()
    
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString())
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.order_by) params.append('order_by', filters.order_by)
    if (filters.order_desc !== undefined) params.append('order_desc', filters.order_desc.toString())

    const response = await axios.get(`${API_BASE}/api/v1/targets/?${params}`)
    return response.data
  },

  // Get single target by ID
  async getTarget(id: number): Promise<Target> {
    const response = await axios.get(`${API_BASE}/api/v1/targets/${id}`)
    return response.data
  },

  // Create new target
  async createTarget(target: CreateTargetRequest): Promise<Target> {
    const response = await axios.post(`${API_BASE}/api/v1/targets/`, target)
    return response.data
  },

  // Update target
  async updateTarget(id: number, updates: Partial<CreateTargetRequest>): Promise<Target> {
    const response = await axios.put(`${API_BASE}/api/v1/targets/${id}`, updates)
    return response.data
  },

  // Update target status
  async updateTargetStatus(id: number, status: string): Promise<void> {
    await axios.patch(`${API_BASE}/api/v1/targets/${id}/status?status=${status}`)
  },

  // Delete target
  async deleteTarget(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/api/v1/targets/${id}`)
  },

  // Get children of wildcard target
  async getTargetChildren(id: number, filters: TargetFilters = {}): Promise<TargetsResponse> {
    const params = new URLSearchParams()
    
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString())
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString())

    const response = await axios.get(`${API_BASE}/api/v1/targets/${id}/children?${params}`)
    return response.data
  },

  // Get wildcard targets for parent selection
  async getWildcardTargets(): Promise<Target[]> {
    const response = await axios.get(`${API_BASE}/api/v1/targets/wildcards/list`)
    return response.data
  },

  // Get scannable targets (non-wildcard only)
  async getScannableTargets(): Promise<Target[]> {
    const response = await axios.get(`${API_BASE}/api/v1/targets/scannable`)
    return response.data
  }
}