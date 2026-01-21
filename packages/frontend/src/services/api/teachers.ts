import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  qualifications: {
    id: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
  }[];
  weeklyHours?: number;
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  phone?: string;
  subjectIds?: string[];
}

export interface UpdateTeacherInput {
  name?: string;
  phone?: string;
  subjectIds?: string[];
}

export interface TeacherListResponse {
  teachers: Teacher[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TeacherListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Get authentication token from localStorage.
 */
function getAuthToken(): string {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
}

/**
 * Create axios instance with auth header.
 */
function createAuthedRequest() {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
}

/**
 * Teacher API service.
 */
export const teachersApi = {
  /**
   * Create a new teacher.
   */
  async create(input: CreateTeacherInput): Promise<Teacher> {
    const api = createAuthedRequest();
    const response = await api.post<{ success: boolean; data: Teacher }>('/teachers', input);
    return response.data.data;
  },

  /**
   * Get list of teachers with pagination.
   */
  async list(params: TeacherListParams = {}): Promise<TeacherListResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: TeacherListResponse }>('/teachers', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get teacher by ID.
   */
  async getById(id: string): Promise<Teacher> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: Teacher }>(`/teachers/${id}`);
    return response.data.data;
  },

  /**
   * Update teacher.
   */
  async update(id: string, input: UpdateTeacherInput): Promise<Teacher> {
    const api = createAuthedRequest();
    const response = await api.put<{ success: boolean; data: Teacher }>(`/teachers/${id}`, input);
    return response.data.data;
  },

  /**
   * Soft delete (deactivate) teacher.
   */
  async deactivate(id: string): Promise<void> {
    const api = createAuthedRequest();
    await api.delete(`/teachers/${id}`);
  },

  /**
   * Get teacher workload.
   */
  async getWorkload(id: string): Promise<{ teacherId: string; weeklyHours: number }> {
    const api = createAuthedRequest();
    const response = await api.get<{
      success: boolean;
      data: { teacherId: string; weeklyHours: number };
    }>(`/teachers/${id}/workload`);
    return response.data.data;
  },
};
