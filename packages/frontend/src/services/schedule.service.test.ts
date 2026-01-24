import axios from 'axios';

import { TimeSlot, CreateTimeSlotRequest, ScheduleFilters } from '../types/schedule.types';

import {
  getSchedule,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  validateTimeSlot,
  getAvailableTeachers,
  getAvailableRooms,
} from './schedule.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Schedule Service', () => {
  const mockToken = 'test-token-123';
  const mockApiInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setItem('accessToken', mockToken);
    mockedAxios.create.mockReturnValue(mockApiInstance as any);
  });

  describe('getSchedule', () => {
    it('should fetch time slots without filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: 'slot-1',
              dayOfWeek: 1,
              startTime: '08:00',
              endTime: '09:30',
              class: { id: 'class-1', name: '10A', gradeLevel: 10 },
              subject: { id: 'sub-1', name: 'Math', code: 'MATH101' },
              teacher: { id: 'teacher-1', name: 'Mr. Nguyen' },
              room: { id: 'room-1', name: 'Room 204', capacity: 40 },
              status: 'SCHEDULED',
            },
          ] as TimeSlot[],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getSchedule();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining<unknown>({
          baseURL: expect.any(String),
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(mockApiInstance.get).toHaveBeenCalledWith('/schedule', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch time slots with filters', async () => {
      const filters: ScheduleFilters = {
        classId: 'class-1',
        teacherId: 'teacher-1',
        dayOfWeek: 1,
      };

      const mockResponse = {
        data: {
          success: true,
          data: [] as TimeSlot[],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getSchedule(filters);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/schedule', { params: filters });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when no auth token', async () => {
      mockLocalStorage.removeItem('accessToken');

      await expect(getSchedule()).rejects.toThrow('No authentication token found');
    });
  });

  describe('createTimeSlot', () => {
    const mockCreateRequest: CreateTimeSlotRequest = {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classId: 'class-1',
      subjectId: 'sub-1',
      teacherId: 'teacher-1',
      roomId: 'room-1',
    };

    it('should create a new time slot successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'slot-1',
            ...mockCreateRequest,
            class: { id: 'class-1', name: '10A', gradeLevel: 10 },
            subject: { id: 'sub-1', name: 'Math', code: 'MATH101' },
            teacher: { id: 'teacher-1', name: 'Mr. Nguyen' },
            room: { id: 'room-1', name: 'Room 204', capacity: 40 },
            status: 'SCHEDULED',
          } as TimeSlot,
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await createTimeSlot(mockCreateRequest);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/schedule', mockCreateRequest);
      expect(result).toEqual(mockResponse.data);
      expect(result.success).toBe(true);
    });

    it('should return error response when creation fails', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'TEACHER_DOUBLE_BOOKED',
          message: 'Teacher Mr. Nguyen is already assigned to Class 10B at this time',
          details: {
            conflictingSlot: {
              id: 'slot-2',
              class: '10B',
              subject: 'Chemistry',
              time: 'Monday 08:00-09:30',
            },
          },
        },
      };

      mockApiInstance.post.mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await createTimeSlot(mockCreateRequest);

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
    });

    it('should throw error when network fails', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(createTimeSlot(mockCreateRequest)).rejects.toThrow('Network error');
    });
  });

  describe('updateTimeSlot', () => {
    const slotId = 'slot-1';
    const updateData: Partial<CreateTimeSlotRequest> = {
      teacherId: 'teacher-2',
      roomId: 'room-2',
    };

    it('should update an existing time slot successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: slotId,
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:30',
            classId: 'class-1',
            subjectId: 'sub-1',
            teacherId: 'teacher-2',
            roomId: 'room-2',
            class: { id: 'class-1', name: '10A', gradeLevel: 10 },
            subject: { id: 'sub-1', name: 'Math', code: 'MATH101' },
            teacher: { id: 'teacher-2', name: 'Ms. Pham' },
            room: { id: 'room-2', name: 'Room 305', capacity: 35 },
            status: 'SCHEDULED',
          } as TimeSlot,
        },
      };

      mockApiInstance.put.mockResolvedValue(mockResponse);

      const result = await updateTimeSlot(slotId, updateData);

      expect(mockApiInstance.put).toHaveBeenCalledWith(`/schedule/${slotId}`, updateData);
      expect(result).toEqual(mockResponse.data);
      expect(result.success).toBe(true);
    });

    it('should return error response when update fails', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'ROOM_DOUBLE_BOOKED',
          message: 'Room 305 is already booked for Class 10C at this time',
          details: {
            conflictingSlot: {
              id: 'slot-3',
              class: '10C',
              subject: 'Physics',
              time: 'Monday 08:00-09:30',
            },
            alternatives: [{ id: 'room-3', name: 'Room 306', capacity: 35 }],
          },
        },
      };

      mockApiInstance.put.mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await updateTimeSlot(slotId, updateData);

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('deleteTimeSlot', () => {
    it('should delete a time slot successfully', async () => {
      mockApiInstance.delete.mockResolvedValue({});

      await deleteTimeSlot('slot-1');

      expect(mockApiInstance.delete).toHaveBeenCalledWith('/schedule/slot-1');
    });

    it('should propagate error when deletion fails', async () => {
      mockApiInstance.delete.mockRejectedValue(new Error('Not found'));

      await expect(deleteTimeSlot('slot-1')).rejects.toThrow('Not found');
    });
  });

  describe('validateTimeSlot', () => {
    const mockValidateRequest: CreateTimeSlotRequest = {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classId: 'class-1',
      subjectId: 'sub-1',
      teacherId: 'teacher-1',
      roomId: 'room-1',
    };

    it('should validate time slot without conflicts', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            valid: true,
            conflicts: [],
          },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await validateTimeSlot(mockValidateRequest);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/schedule/validate', mockValidateRequest);
      expect(result).toEqual(mockResponse.data);
      expect(result.success).toBe(true);
    });

    it('should return conflicts when validation fails', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'TEACHER_DOUBLE_BOOKED',
          message: 'Teacher Mr. Nguyen is already assigned to Class 10B at this time',
          details: {
            conflictingSlot: {
              id: 'slot-2',
              class: '10B',
              subject: 'Chemistry',
              time: 'Monday 08:00-09:30',
            },
          },
        },
      };

      mockApiInstance.post.mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await validateTimeSlot(mockValidateRequest);

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
    });

    it('should support excludeSlotId for updates', async () => {
      const requestWithExclude = {
        ...mockValidateRequest,
        excludeSlotId: 'slot-1',
      };

      const mockResponse = {
        data: {
          success: true,
          data: { valid: true, conflicts: [] },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      await validateTimeSlot(requestWithExclude);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/schedule/validate', requestWithExclude);
    });
  });

  describe('getAvailableTeachers', () => {
    const params = {
      subjectId: 'sub-1',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
    };

    it('should fetch available teachers', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 'teacher-1', name: 'Mr. Nguyen', phone: '123-456-7890' },
            { id: 'teacher-2', name: 'Ms. Pham', phone: '098-765-4321' },
          ],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getAvailableTeachers(params);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/schedule/available-teachers', { params });
      expect(result).toEqual(mockResponse.data);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when no teachers available', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getAvailableTeachers(params);

      expect(result.data).toEqual([]);
    });

    it('should return error response when request fails', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('API error'));

      const result = await getAvailableTeachers(params);

      expect(result).toEqual({
        success: false,
        data: [],
        error: { message: 'Failed to fetch available teachers' },
      });
    });
  });

  describe('getAvailableRooms', () => {
    const params = {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
    };

    it('should fetch available rooms without capacity filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: 'room-1', name: 'Room 204', capacity: 40, type: 'CLASSROOM' },
            { id: 'room-2', name: 'Room 305', capacity: 35, type: 'CLASSROOM' },
          ],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getAvailableRooms(params);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/schedule/available-rooms', { params });
      expect(result).toEqual(mockResponse.data);
      expect(result.data).toHaveLength(2);
    });

    it('should fetch available rooms with minimum capacity', async () => {
      const paramsWithCapacity = {
        ...params,
        minimumCapacity: 40,
      };

      const mockResponse = {
        data: {
          success: true,
          data: [{ id: 'room-1', name: 'Room 204', capacity: 40, type: 'CLASSROOM' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getAvailableRooms(paramsWithCapacity);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/schedule/available-rooms', {
        params: paramsWithCapacity,
      });
      expect(result.data).toHaveLength(1);
    });

    it('should return empty array when no rooms available', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await getAvailableRooms(params);

      expect(result.data).toEqual([]);
    });

    it('should return error response when request fails', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('API error'));

      const result = await getAvailableRooms(params);

      expect(result).toEqual({
        success: false,
        data: [],
        error: { message: 'Failed to fetch available rooms' },
      });
    });
  });

  describe('Authentication', () => {
    it('should create axios instance with correct auth header', async () => {
      const mockResponse = {
        data: { success: true, data: [] },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      await getSchedule();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining<unknown>({
          baseURL: expect.any(String),
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
    });

    it('should throw error when token is missing', async () => {
      mockLocalStorage.removeItem('accessToken');

      await expect(createTimeSlot({} as CreateTimeSlotRequest)).rejects.toThrow(
        'No authentication token found',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for createTimeSlot', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(createTimeSlot({} as CreateTimeSlotRequest)).rejects.toThrow('Network error');
    });

    it('should handle network errors for updateTimeSlot', async () => {
      mockApiInstance.put.mockRejectedValue(new Error('Network error'));

      await expect(updateTimeSlot('slot-1', {})).rejects.toThrow('Network error');
    });

    it('should handle API error responses with structured error data', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
        },
      };

      mockApiInstance.post.mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await createTimeSlot({} as CreateTimeSlotRequest);

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});
