import axios, { AxiosInstance } from 'axios';

import {
  TimeSlot,
  CreateTimeSlotRequest,
  ScheduleFilters,
  ValidationResult,
  AvailableTeacher,
  AvailableRoom,
} from '../types/schedule.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

const API_BASE_URL = 'http://localhost:3000/api';

const createAuthenticatedAxios = (): AxiosInstance => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSchedule = async (filters?: ScheduleFilters): Promise<ApiResponse<TimeSlot[]>> => {
  const api = createAuthenticatedAxios();
  const response = await api.get('/schedule', { params: filters || {} });
  return response.data;
};

export const createTimeSlot = async (
  data: CreateTimeSlotRequest,
): Promise<ApiResponse<TimeSlot>> => {
  const api = createAuthenticatedAxios();
  try {
    const response = await api.post('/schedule', data);
    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<TimeSlot> } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    throw error;
  }
};

export const updateTimeSlot = async (
  id: string,
  data: Partial<CreateTimeSlotRequest>,
): Promise<ApiResponse<TimeSlot>> => {
  const api = createAuthenticatedAxios();
  try {
    const response = await api.put(`/schedule/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<TimeSlot> } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    throw error;
  }
};

export const deleteTimeSlot = async (id: string): Promise<void> => {
  const api = createAuthenticatedAxios();
  await api.delete(`/schedule/${id}`);
};

export const validateTimeSlot = async (
  data: CreateTimeSlotRequest & { excludeSlotId?: string },
): Promise<ApiResponse<ValidationResult>> => {
  const api = createAuthenticatedAxios();
  try {
    const response = await api.post('/schedule/validate', data);
    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<ValidationResult> } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    throw error;
  }
};

export const getAvailableTeachers = async (params: {
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): Promise<ApiResponse<AvailableTeacher[]>> => {
  const api = createAuthenticatedAxios();
  try {
    const response = await api.get('/schedule/available-teachers', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      error: { message: 'Failed to fetch available teachers' },
    };
  }
};

export const getAvailableRooms = async (params: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  minimumCapacity?: number;
}): Promise<ApiResponse<AvailableRoom[]>> => {
  const api = createAuthenticatedAxios();
  try {
    const response = await api.get('/schedule/available-rooms', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      error: { message: 'Failed to fetch available rooms' },
    };
  }
};
