import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export interface Target {
  id: number
  name: string
  domain: string
  port?: string
  description?: string
  status: string
  activeScans: number
  completedScans: number
  createdAt: string
  updatedAt?: string
  targetUrl: string
  folderName?: string
}

export interface CreateTargetRequest {
  name: string
  domain: string
  port?: string
  description?: string
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

    const response = await axios.get(`${API_BASE}/api/v1/targets/?${params.toString()}`)
    return response.data
  },

  // Get single target
  async getTarget(id: number): Promise<Target> {
    const response = await axios.get(`${API_BASE}/api/v1/targets/${id}`)
    return response.data
  },

  // Create new target
  async createTarget(data: CreateTargetRequest): Promise<Target> {
    const response = await axios.post(`${API_BASE}/api/v1/targets/`, data)
    return response.data
  },

  // Update target
  async updateTarget(id: number, data: Partial<CreateTargetRequest>): Promise<Target> {
    const response = await axios.put(`${API_BASE}/api/v1/targets/${id}`, data)
    return response.data
  },

  // Delete target
  async deleteTarget(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/api/v1/targets/${id}`)
  },

  // Get scannable targets (all targets are scannable now)
  async getScannableTargets(): Promise<Target[]> {
    const response = await axios.get(`${API_BASE}/api/v1/targets/scannable/list`)
    return response.data
  }
}
