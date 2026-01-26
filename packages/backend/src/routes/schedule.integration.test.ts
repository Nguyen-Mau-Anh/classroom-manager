import request from 'supertest';

import { AppError } from '../errors/app-error';
import { app } from '../server';
import { scheduleService } from '../services/scheduleService';
import { generateTokenPair } from '../utils/jwt';

// Mock service
jest.mock('../services/scheduleService', () => ({
  scheduleService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validateOnly: jest.fn(),
    getAvailableTeachers: jest.fn(),
    getAvailableRooms: jest.fn(),
  },
}));

describe('Schedule API Integration Tests', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;

  beforeAll(() => {
    // Generate tokens for testing
    adminToken = generateTokenPair({ userId: 'admin-1', role: 'ADMIN' }).accessToken;
    teacherToken = generateTokenPair({ userId: 'teacher-1', role: 'TEACHER' }).accessToken;
    studentToken = generateTokenPair({ userId: 'student-1', role: 'STUDENT' }).accessToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Suite 1: Full CRUD flow for time slots
  describe('CRUD Flow for Time Slots', () => {
    it('should create a time slot with valid data (Admin only)', async () => {
      const mockTimeSlot = {
        id: 'timeslot-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        status: 'SCHEDULED',
        class: {
          id: 'class-1',
          name: 'Grade 10A',
        },
        subject: {
          id: 'subject-1',
          code: 'MATH101',
          name: 'Mathematics I',
        },
        teacher: {
          id: 'teacher-1',
          name: 'Ms. Linh Pham',
        },
        room: {
          id: 'room-1',
          name: 'Room 201',
          capacity: 40,
          type: 'classroom',
        },
        createdAt: new Date(),
      };

      (scheduleService.create as jest.Mock).mockResolvedValue(mockTimeSlot);

      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dayOfWeek).toBe(1);
      expect(response.body.data.startTime).toBe('08:00');
      expect(response.body.data.class.name).toBe('Grade 10A');
    });

    it('should reject time slot creation for non-admin users', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should list time slots with pagination and filters', async () => {
      const mockSchedule = {
        timeSlots: [
          {
            id: 'timeslot-1',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:30',
            status: 'SCHEDULED',
            class: { id: 'class-1', name: 'Grade 10A' },
            subject: { id: 'subject-1', code: 'MATH101', name: 'Mathematics I' },
            teacher: { id: 'teacher-1', name: 'Ms. Linh Pham' },
            room: { id: 'room-1', name: 'Room 201', capacity: 40, type: 'classroom' },
          },
        ],
        pagination: {
          page: 1,
          pageSize: 100,
          total: 1,
        },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 100, classId: 'class-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timeSlots).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should allow teachers to view schedules (read-only)', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: {
          page: 1,
          pageSize: 100,
          total: 0,
        },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .query({ page: 1, teacherId: 'teacher-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get time slot by ID with full details', async () => {
      const mockTimeSlot = {
        id: 'timeslot-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        status: 'SCHEDULED',
        class: { id: 'class-1', name: 'Grade 10A' },
        subject: { id: 'subject-1', code: 'MATH101', name: 'Mathematics I' },
        teacher: { id: 'teacher-1', name: 'Ms. Linh Pham' },
        room: { id: 'room-1', name: 'Room 201', capacity: 40, type: 'classroom' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (scheduleService.getById as jest.Mock).mockResolvedValue(mockTimeSlot);

      const response = await request(app)
        .get('/api/schedule/timeslot-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('timeslot-1');
      expect(response.body.data.class.name).toBe('Grade 10A');
    });

    it('should return 404 for non-existent time slot', async () => {
      (scheduleService.getById as jest.Mock).mockRejectedValue(
        AppError.notFound('Time slot'),
      );

      const response = await request(app)
        .get('/api/schedule/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should update time slot with valid data (Admin only)', async () => {
      const mockUpdatedTimeSlot = {
        id: 'timeslot-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:00',
        status: 'SCHEDULED',
        class: { id: 'class-1', name: 'Grade 10A' },
        subject: { id: 'subject-1', code: 'MATH101', name: 'Mathematics I' },
        teacher: { id: 'teacher-2', name: 'Mr. Hai Tran' },
        room: { id: 'room-1', name: 'Room 201', capacity: 40, type: 'classroom' },
      };

      (scheduleService.update as jest.Mock).mockResolvedValue(mockUpdatedTimeSlot);

      const response = await request(app)
        .put('/api/schedule/timeslot-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          endTime: '10:00',
          teacherId: 'teacher-2',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.endTime).toBe('10:00');
      expect(response.body.data.teacher.id).toBe('teacher-2');
    });

    it('should reject time slot update for non-admin users', async () => {
      const response = await request(app)
        .put('/api/schedule/timeslot-1')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          endTime: '10:00',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should delete time slot (Admin only)', async () => {
      (scheduleService.delete as jest.Mock).mockResolvedValue({
        message: 'Time slot deleted successfully',
      });

      const response = await request(app)
        .delete('/api/schedule/timeslot-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Time slot deleted successfully');
    });

    it('should reject time slot deletion for non-admin users', async () => {
      const response = await request(app)
        .delete('/api/schedule/timeslot-1')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // Test Suite 2: Constraint validation
  describe('Constraint Validation', () => {
    it('should validate constraints without saving', async () => {
      (scheduleService.validateOnly as jest.Mock).mockResolvedValue({
        valid: true,
        message: 'Schedule is valid',
      });

      const response = await request(app)
        .post('/api/schedule/validate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
    });

    it('should detect teacher double-booking conflict', async () => {
      (scheduleService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Teacher Ms. Linh Pham is already assigned to Grade 9B at this time', [
          { field: 'teacherId', message: 'Teacher already assigned at this time' },
        ]),
      );

      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already assigned');
    });

    it('should detect room double-booking conflict', async () => {
      (scheduleService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Room 201 is already booked for Grade 9B at this time', [
          { field: 'roomId', message: 'Room already booked at this time' },
        ]),
      );

      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already booked');
    });

    it('should detect teacher not qualified for subject', async () => {
      (scheduleService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Teacher Mr. Hai Tran is not qualified to teach Physics', [
          { field: 'teacherId', message: 'Teacher not qualified for this subject' },
        ]),
      );

      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-physics',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not qualified');
    });

    it('should reject invalid time range (endTime before startTime)', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:30',
          endTime: '08:00',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid dayOfWeek (outside 0-6 range)', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 7,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid time format', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '8:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Test Suite 3: "What fits" algorithm
  describe('Available Teachers and Rooms', () => {
    it('should get available qualified teachers for a time slot', async () => {
      const mockTeachers = {
        teachers: [
          {
            id: 'teacher-1',
            name: 'Ms. Linh Pham',
            qualified: true,
            currentDayWorkload: 3,
            qualificationDate: new Date('2026-01-15'),
          },
          {
            id: 'teacher-2',
            name: 'Mr. Hai Tran',
            qualified: true,
            currentDayWorkload: 2,
            qualificationDate: new Date('2026-01-10'),
          },
        ],
      };

      (scheduleService.getAvailableTeachers as jest.Mock).mockResolvedValue(mockTeachers);

      const response = await request(app)
        .get('/api/schedule/available-teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          subjectId: 'subject-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teachers).toHaveLength(2);
      expect(response.body.data.teachers[0].qualified).toBe(true);
    });

    it('should sort available teachers by lowest workload first', async () => {
      const mockTeachers = {
        teachers: [
          {
            id: 'teacher-2',
            name: 'Mr. Hai Tran',
            qualified: true,
            currentDayWorkload: 2,
            qualificationDate: new Date('2026-01-10'),
          },
          {
            id: 'teacher-1',
            name: 'Ms. Linh Pham',
            qualified: true,
            currentDayWorkload: 3,
            qualificationDate: new Date('2026-01-15'),
          },
        ],
      };

      (scheduleService.getAvailableTeachers as jest.Mock).mockResolvedValue(mockTeachers);

      const response = await request(app)
        .get('/api/schedule/available-teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          subjectId: 'subject-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.teachers[0].currentDayWorkload).toBeLessThanOrEqual(
        response.body.data.teachers[1].currentDayWorkload,
      );
    });

    it('should get available rooms for a time slot', async () => {
      const mockRooms = {
        rooms: [
          {
            id: 'room-1',
            name: 'Room 201',
            capacity: 40,
            type: 'classroom',
            available: true,
          },
          {
            id: 'room-2',
            name: 'Lab 1',
            capacity: 30,
            type: 'lab',
            available: true,
          },
        ],
      };

      (scheduleService.getAvailableRooms as jest.Mock).mockResolvedValue(mockRooms);

      const response = await request(app)
        .get('/api/schedule/available-rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rooms).toHaveLength(2);
      expect(response.body.data.rooms[0].available).toBe(true);
    });

    it('should allow students to view available teachers/rooms', async () => {
      const mockTeachers = { teachers: [] };
      (scheduleService.getAvailableTeachers as jest.Mock).mockResolvedValue(mockTeachers);

      const response = await request(app)
        .get('/api/schedule/available-teachers')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          subjectId: 'subject-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Test Suite 4: Pagination and filtering
  describe('Pagination and Filtering', () => {
    it('should paginate schedule with default pageSize of 100', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: {
          page: 1,
          pageSize: 100,
          total: 0,
        },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.pageSize).toBe(100);
    });

    it('should filter schedule by classId', async () => {
      const mockSchedule = {
        timeSlots: [
          {
            id: 'timeslot-1',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:30',
            status: 'SCHEDULED',
            class: { id: 'class-1', name: 'Grade 10A' },
            subject: { id: 'subject-1', code: 'MATH101', name: 'Mathematics I' },
            teacher: { id: 'teacher-1', name: 'Ms. Linh Pham' },
            room: { id: 'room-1', name: 'Room 201', capacity: 40, type: 'classroom' },
          },
        ],
        pagination: {
          page: 1,
          pageSize: 100,
          total: 1,
        },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ classId: 'class-1' });

      expect(response.status).toBe(200);
      expect(scheduleService.list).toHaveBeenCalledWith(
        expect.objectContaining({ classId: 'class-1' }),
      );
    });

    it('should filter schedule by teacherId', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: { page: 1, pageSize: 100, total: 0 },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ teacherId: 'teacher-1' });

      expect(response.status).toBe(200);
      expect(scheduleService.list).toHaveBeenCalledWith(
        expect.objectContaining({ teacherId: 'teacher-1' }),
      );
    });

    it('should filter schedule by roomId', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: { page: 1, pageSize: 100, total: 0 },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ roomId: 'room-1' });

      expect(response.status).toBe(200);
      expect(scheduleService.list).toHaveBeenCalledWith(
        expect.objectContaining({ roomId: 'room-1' }),
      );
    });

    it('should filter schedule by dayOfWeek', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: { page: 1, pageSize: 100, total: 0 },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ dayOfWeek: 1 });

      expect(response.status).toBe(200);
      expect(scheduleService.list).toHaveBeenCalledWith(
        expect.objectContaining({ dayOfWeek: 1 }),
      );
    });
  });

  // Test Suite 5: Authentication and authorization
  describe('Authentication and Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/schedule');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow authenticated teachers to view schedules', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: { page: 1, pageSize: 100, total: 0 },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow authenticated students to view schedules', async () => {
      const mockSchedule = {
        timeSlots: [],
        pagination: { page: 1, pageSize: 100, total: 0 },
      };

      (scheduleService.list as jest.Mock).mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject teacher attempts to create time slots', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(403);
    });

    it('should reject student attempts to create time slots', async () => {
      const response = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
        });

      expect(response.status).toBe(403);
    });
  });
});
