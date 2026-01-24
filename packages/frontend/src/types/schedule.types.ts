export type TimeSlotStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classId: string;
  class: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  subjectId: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacherId: string;
  teacher: {
    id: string;
    name: string;
  };
  roomId: string;
  room: {
    id: string;
    name: string;
    capacity: number;
  };
  status: TimeSlotStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeSlotRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
}

export interface ScheduleFilters {
  classId?: string;
  teacherId?: string;
  roomId?: string;
  dayOfWeek?: number;
  startDate?: string;
  endDate?: string;
}

export interface ValidationResult {
  valid: boolean;
  conflicts?: Array<{
    type: 'TEACHER_CONFLICT' | 'ROOM_CONFLICT' | 'TIME_OVERLAP';
    message: string;
    conflictingSlot?: TimeSlot;
  }>;
}

export interface AvailableTeacher {
  id: string;
  name: string;
  email: string;
  subjectIds: string[];
}

export interface AvailableRoom {
  id: string;
  name: string;
  capacity: number;
  building?: string;
}
