import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  capacity: number;
  enrollmentCount: number;
  enrollmentPercentage: number;
  waitlistCount: number;
  room: {
    id: string;
    name: string;
  } | null;
}

export interface ClassDetails {
  id: string;
  name: string;
  gradeLevel: number;
  capacity: number;
  enrollmentCount: number;
  waitlistCount: number;
  room: {
    id: string;
    name: string;
    capacity: number;
    type: string;
  } | null;
  students: {
    id: string;
    name: string;
    gradeLevel: number;
  }[];
}

export interface CreateClassInput {
  name: string;
  gradeLevel: number;
  capacity: number;
  roomId?: string;
}

export interface UpdateClassInput {
  name?: string;
  gradeLevel?: number;
  capacity?: number;
  roomId?: string | null;
}

export interface ClassListResponse {
  classes: Class[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ClassListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  gradeLevel?: number;
}

export interface WaitlistEntry {
  position: number;
  studentId: string;
  studentName: string;
  joinedAt: string;
}

export interface WaitlistResponse {
  classId: string;
  className: string;
  capacity: number;
  enrolled: number;
  isFull: boolean;
  waitlistCount: number;
  waitlist: WaitlistEntry[];
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
 * Class API service.
 */
export const classesApi = {
  /**
   * Create a new class.
   */
  async create(input: CreateClassInput): Promise<ClassDetails> {
    const api = createAuthedRequest();
    const response = await api.post<{ success: boolean; data: ClassDetails }>('/classes', input);
    return response.data.data;
  },

  /**
   * Get list of classes with pagination.
   */
  async list(params: ClassListParams = {}): Promise<ClassListResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: ClassListResponse }>('/classes', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get class by ID.
   */
  async getById(id: string): Promise<ClassDetails> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: ClassDetails }>(`/classes/${id}`);
    return response.data.data;
  },

  /**
   * Update class.
   */
  async update(id: string, input: UpdateClassInput): Promise<ClassDetails> {
    const api = createAuthedRequest();
    const response = await api.put<{ success: boolean; data: ClassDetails }>(
      `/classes/${id}`,
      input,
    );
    return response.data.data;
  },

  /**
   * Delete class.
   */
  async delete(id: string): Promise<void> {
    const api = createAuthedRequest();
    await api.delete(`/classes/${id}`);
  },

  /**
   * Get class waitlist.
   */
  async getWaitlist(id: string): Promise<WaitlistResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: WaitlistResponse }>(
      `/classes/${id}/waitlist`,
    );
    return response.data.data;
  },
};
