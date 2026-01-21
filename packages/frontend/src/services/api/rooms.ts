import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export type RoomType = 'classroom' | 'lab' | 'gym';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  bookedSlots: number;
}

export interface RoomDetails {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  bookedSlots: number;
  defaultClasses: {
    id: string;
    name: string;
    gradeLevel: number;
  }[];
}

export interface CreateRoomInput {
  name: string;
  capacity: number;
  type: RoomType;
}

export interface UpdateRoomInput {
  name?: string;
  capacity?: number;
  type?: RoomType;
}

export interface RoomListResponse {
  rooms: Room[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface RoomListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: RoomType;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  class: string;
  subject: string;
  teacher: string;
  status: string;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  slots: TimeSlot[];
}

export interface RoomScheduleResponse {
  roomId: string;
  roomName: string;
  week: string;
  schedule: DaySchedule[];
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
 * Room API service.
 */
export const roomsApi = {
  /**
   * Create a new room.
   */
  async create(input: CreateRoomInput): Promise<RoomDetails> {
    const api = createAuthedRequest();
    const response = await api.post<{ success: boolean; data: RoomDetails }>('/rooms', input);
    return response.data.data;
  },

  /**
   * Get list of rooms with pagination.
   */
  async list(params: RoomListParams = {}): Promise<RoomListResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: RoomListResponse }>('/rooms', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get room by ID.
   */
  async getById(id: string): Promise<RoomDetails> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: RoomDetails }>(`/rooms/${id}`);
    return response.data.data;
  },

  /**
   * Update room.
   */
  async update(id: string, input: UpdateRoomInput): Promise<RoomDetails> {
    const api = createAuthedRequest();
    const response = await api.put<{ success: boolean; data: RoomDetails }>(`/rooms/${id}`, input);
    return response.data.data;
  },

  /**
   * Delete room.
   */
  async delete(id: string): Promise<void> {
    const api = createAuthedRequest();
    await api.delete(`/rooms/${id}`);
  },

  /**
   * Get room schedule.
   */
  async getSchedule(id: string, week?: string): Promise<RoomScheduleResponse> {
    const api = createAuthedRequest();
    const response = await api.get<{ success: boolean; data: RoomScheduleResponse }>(
      `/rooms/${id}/schedule`,
      {
        params: week ? { week } : {},
      },
    );
    return response.data.data;
  },
};
