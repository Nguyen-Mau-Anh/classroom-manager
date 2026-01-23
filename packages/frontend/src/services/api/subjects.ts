import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isMandatory: boolean;
  isActive: boolean;
  prerequisiteCount: number;
  qualifiedTeacherCount: number;
  enrollmentCount: number;
  prerequisites?: SubjectPrerequisite[];
  qualifiedTeachers?: QualifiedTeacher[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectPrerequisite {
  id: string;
  code: string;
  name: string;
  isMandatory: boolean;
  prerequisites?: SubjectPrerequisite[];
}

export interface QualifiedTeacher {
  id: string;
  name: string;
  email: string;
  qualificationDate?: string;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  description?: string;
  isMandatory?: boolean;
  prerequisiteIds?: string[];
  qualifiedTeacherIds?: string[];
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  description?: string;
  isMandatory?: boolean;
  prerequisiteIds?: string[];
  qualifiedTeacherIds?: string[];
}

export interface SubjectListResponse {
  subjects: Subject[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SubjectListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isMandatory?: boolean;
  hasPrerequisites?: boolean;
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
 * Subject API service.
 */
export const subjectsApi = {
  /**
   * Create a new subject.
   */
  async create(input: CreateSubjectInput): Promise<Subject> {
    const api = createAuthedRequest();
    const response = await api.post<{ success: boolean; data: Subject }>('/subjects', input);
    return response.data.data;
  },

  /**
   * Get list of subjects with pagination.
   */
  async list(params: SubjectListParams = {}): Promise<SubjectListResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: SubjectListResponse }>('/subjects', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get subject by ID.
   */
  async getById(id: string): Promise<Subject> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: Subject }>(`/subjects/${id}`);
    return response.data.data;
  },

  /**
   * Update subject.
   */
  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const api = createAuthedRequest();
    const response = await api.put<{ success: boolean; data: Subject }>(`/subjects/${id}`, input);
    return response.data.data;
  },

  /**
   * Soft delete subject.
   */
  async delete(id: string): Promise<void> {
    const api = createAuthedRequest();
    await api.delete(`/subjects/${id}`);
  },

  /**
   * Get qualified teachers for a subject.
   */
  async getQualifiedTeachers(id: string): Promise<QualifiedTeacher[]> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: QualifiedTeacher[] }>(
      `/subjects/${id}/teachers`,
    );
    return response.data.data;
  },

  /**
   * Update qualified teachers for a subject.
   */
  async updateQualifiedTeachers(id: string, teacherIds: string[]): Promise<QualifiedTeacher[]> {
    const api = createAuthedRequest();
    const response = await api.put<{
      success: boolean;
      data: { qualifiedTeachers: QualifiedTeacher[] };
    }>(`/subjects/${id}/teachers`, { teacherIds });
    return response.data.data.qualifiedTeachers;
  },
};
