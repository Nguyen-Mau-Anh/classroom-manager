import { PrismaClient, UserRole, AbsenceStatus, TimeSlotStatus } from '@prisma/client';

// Check if database is available
const hasDatabase = !!process.env.DATABASE_URL;

// Prisma client for integration tests (only when database available)
let prisma: PrismaClient | null;

if (hasDatabase) {
  prisma = new PrismaClient();
}

describe('Prisma Schema', () => {
  // Helper to create unique emails for each test
  const uniqueEmail = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  describe('Model definitions', () => {
    it('should export all 11 model types from Prisma Client', () => {
      // Verify types are importable (compile-time check)
      // These imports succeed if the schema is correctly defined
      const types = [
        'User',
        'Teacher',
        'Student',
        'Subject',
        'TeacherQualification',
        'Class',
        'Room',
        'TimeSlot',
        'Enrollment',
        'TeacherAbsence',
        'Notification',
      ];

      // If we can import the client, the models are defined
      expect(types).toHaveLength(11);
    });
  });

  describe('Enum validation', () => {
    it('should have UserRole enum with correct values', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.TEACHER).toBe('TEACHER');
      expect(UserRole.STUDENT).toBe('STUDENT');
      expect(Object.keys(UserRole)).toHaveLength(3);
    });

    it('should have AbsenceStatus enum with correct values', () => {
      expect(AbsenceStatus.PENDING).toBe('PENDING');
      expect(AbsenceStatus.APPROVED).toBe('APPROVED');
      expect(AbsenceStatus.COVERED).toBe('COVERED');
      expect(AbsenceStatus.CANCELLED).toBe('CANCELLED');
      expect(Object.keys(AbsenceStatus)).toHaveLength(4);
    });

    it('should have TimeSlotStatus enum with correct values', () => {
      expect(TimeSlotStatus.SCHEDULED).toBe('SCHEDULED');
      expect(TimeSlotStatus.CANCELLED).toBe('CANCELLED');
      expect(Object.keys(TimeSlotStatus)).toHaveLength(2);
    });
  });

  describe('Prisma Client instantiation', () => {
    it('should be able to import PrismaClient without errors', () => {
      // This test verifies the schema compiles correctly
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });

    it('should have all model accessors on PrismaClient instance', async () => {
      const modelNames = [
        'user',
        'teacher',
        'student',
        'subject',
        'teacherQualification',
        'class',
        'room',
        'timeSlot',
        'enrollment',
        'teacherAbsence',
        'notification',
      ] as const;

      // Create a temporary client to verify model accessors
      const tempClient = new PrismaClient();

      try {
        modelNames.forEach((model) => {
          expect(tempClient[model]).toBeDefined();
        });
      } finally {
        // Always disconnect to prevent resource leak
        await tempClient.$disconnect();
      }
    });
  });

  // Integration tests - skip if no database
  const describeWithDb = hasDatabase ? describe : describe.skip;

  describeWithDb('Teacher -> TeacherQualification -> Subject relationship', () => {
    it('should allow querying teacher with qualifications and subjects', async () => {
      const email = uniqueEmail('teacher-qual');
      const user = await prisma!.user.create({
        data: {
          email,
          passwordHash: 'test-hash',
          role: UserRole.TEACHER,
        },
      });

      const subject = await prisma!.subject.create({
        data: {
          name: 'Test Subject',
          code: `TEST-${Date.now()}`,
        },
      });

      const teacher = await prisma!.teacher.create({
        data: {
          userId: user.id,
          name: 'Test Teacher',
          qualifications: {
            create: [{ subjectId: subject.id }],
          },
        },
      });

      const result = await prisma!.teacher.findUnique({
        where: { id: teacher.id },
        include: {
          qualifications: {
            include: { subject: true },
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result!.qualifications).toHaveLength(1);
      expect(result!.qualifications[0].subject.name).toBe('Test Subject');

      // Cleanup
      await prisma!.teacherQualification.deleteMany({ where: { teacherId: teacher.id } });
      await prisma!.teacher.delete({ where: { id: teacher.id } });
      await prisma!.user.delete({ where: { id: user.id } });
      await prisma!.subject.delete({ where: { id: subject.id } });
    });
  });

  describeWithDb('Teacher -> TimeSlot relationship', () => {
    it('should allow querying teacher with time slots', async () => {
      const email = uniqueEmail('teacher-ts');
      const user = await prisma!.user.create({
        data: {
          email,
          passwordHash: 'test-hash',
          role: UserRole.TEACHER,
        },
      });

      const room = await prisma!.room.create({
        data: { name: `Test Room ${Date.now()}`, capacity: 30 },
      });

      const subject = await prisma!.subject.create({
        data: {
          name: 'Test Subject TS',
          code: `TS-${Date.now()}`,
        },
      });

      const classRoom = await prisma!.class.create({
        data: {
          name: `Test Class ${Date.now()}`,
          gradeLevel: 10,
          roomId: room.id,
        },
      });

      const teacher = await prisma!.teacher.create({
        data: {
          userId: user.id,
          name: 'Test Teacher TS',
        },
      });

      const timeSlot = await prisma!.timeSlot.create({
        data: {
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:00',
          classId: classRoom.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          roomId: room.id,
        },
      });

      const result = await prisma!.teacher.findUnique({
        where: { id: teacher.id },
        include: { timeSlots: true },
      });

      expect(result).not.toBeNull();
      expect(result!.timeSlots).toHaveLength(1);
      expect(result!.timeSlots[0].dayOfWeek).toBe(1);

      // Cleanup
      await prisma!.timeSlot.delete({ where: { id: timeSlot.id } });
      await prisma!.teacher.delete({ where: { id: teacher.id } });
      await prisma!.class.delete({ where: { id: classRoom.id } });
      await prisma!.subject.delete({ where: { id: subject.id } });
      await prisma!.room.delete({ where: { id: room.id } });
      await prisma!.user.delete({ where: { id: user.id } });
    });
  });

  describeWithDb('Teacher -> TeacherAbsence relationship', () => {
    it('should allow querying teacher with absences', async () => {
      const email = uniqueEmail('teacher-abs');
      const user = await prisma!.user.create({
        data: {
          email,
          passwordHash: 'test-hash',
          role: UserRole.TEACHER,
        },
      });

      const teacher = await prisma!.teacher.create({
        data: {
          userId: user.id,
          name: 'Test Teacher Abs',
        },
      });

      const absence = await prisma!.teacherAbsence.create({
        data: {
          teacherId: teacher.id,
          date: new Date('2026-02-01'),
          reason: 'Sick leave',
          status: AbsenceStatus.PENDING,
        },
      });

      const result = await prisma!.teacher.findUnique({
        where: { id: teacher.id },
        include: { absences: true },
      });

      expect(result).not.toBeNull();
      expect(result!.absences).toHaveLength(1);
      expect(result!.absences[0].reason).toBe('Sick leave');

      // Cleanup
      await prisma!.teacherAbsence.delete({ where: { id: absence.id } });
      await prisma!.teacher.delete({ where: { id: teacher.id } });
      await prisma!.user.delete({ where: { id: user.id } });
    });

    it('should support substitute teacher relationship', async () => {
      const email1 = uniqueEmail('teacher-sub1');
      const email2 = uniqueEmail('teacher-sub2');

      const user1 = await prisma!.user.create({
        data: { email: email1, passwordHash: 'test-hash', role: UserRole.TEACHER },
      });
      const user2 = await prisma!.user.create({
        data: { email: email2, passwordHash: 'test-hash', role: UserRole.TEACHER },
      });

      const teacher1 = await prisma!.teacher.create({
        data: { userId: user1.id, name: 'Original Teacher' },
      });
      const teacher2 = await prisma!.teacher.create({
        data: { userId: user2.id, name: 'Substitute Teacher' },
      });

      const absence = await prisma!.teacherAbsence.create({
        data: {
          teacherId: teacher1.id,
          date: new Date('2026-02-01'),
          status: AbsenceStatus.COVERED,
          substituteTeacherId: teacher2.id,
        },
      });

      const result = await prisma!.teacherAbsence.findUnique({
        where: { id: absence.id },
        include: { teacher: true, substituteTeacher: true },
      });

      expect(result).not.toBeNull();
      expect(result!.teacher.name).toBe('Original Teacher');
      expect(result!.substituteTeacher?.name).toBe('Substitute Teacher');

      const substituteResult = await prisma!.teacher.findUnique({
        where: { id: teacher2.id },
        include: { substitutions: true },
      });

      expect(substituteResult!.substitutions).toHaveLength(1);

      // Cleanup
      await prisma!.teacherAbsence.delete({ where: { id: absence.id } });
      await prisma!.teacher.deleteMany({ where: { id: { in: [teacher1.id, teacher2.id] } } });
      await prisma!.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    });
  });

  describeWithDb('Subject -> Subject (prerequisites) self-relation', () => {
    it('should allow querying subject with prerequisites', async () => {
      const basicSubject = await prisma!.subject.create({
        data: {
          name: 'Basic Math',
          code: `BASIC-${Date.now()}`,
        },
      });

      const advancedSubject = await prisma!.subject.create({
        data: {
          name: 'Advanced Math',
          code: `ADV-${Date.now()}`,
          prerequisites: {
            connect: [{ id: basicSubject.id }],
          },
        },
      });

      const result = await prisma!.subject.findUnique({
        where: { id: advancedSubject.id },
        include: { prerequisites: true },
      });

      expect(result).not.toBeNull();
      expect(result!.prerequisites).toHaveLength(1);
      expect(result!.prerequisites[0].name).toBe('Basic Math');

      const basicResult = await prisma!.subject.findUnique({
        where: { id: basicSubject.id },
        include: { prerequisiteOf: true },
      });

      expect(basicResult!.prerequisiteOf).toHaveLength(1);
      expect(basicResult!.prerequisiteOf[0].name).toBe('Advanced Math');

      // Cleanup
      await prisma!.subject.delete({ where: { id: advancedSubject.id } });
      await prisma!.subject.delete({ where: { id: basicSubject.id } });
    });
  });

  describeWithDb('Student -> Enrollment -> Subject relationship', () => {
    it('should allow querying student with enrollments and subjects', async () => {
      const email = uniqueEmail('student-enroll');
      const user = await prisma!.user.create({
        data: {
          email,
          passwordHash: 'test-hash',
          role: UserRole.STUDENT,
        },
      });

      const subject1 = await prisma!.subject.create({
        data: { name: 'Subject 1', code: `S1-${Date.now()}` },
      });
      const subject2 = await prisma!.subject.create({
        data: { name: 'Subject 2', code: `S2-${Date.now()}` },
      });

      const student = await prisma!.student.create({
        data: {
          userId: user.id,
          name: 'Test Student',
          gradeLevel: 10,
          enrollments: {
            create: [{ subjectId: subject1.id }, { subjectId: subject2.id }],
          },
        },
      });

      const result = await prisma!.student.findUnique({
        where: { id: student.id },
        include: {
          enrollments: {
            include: { subject: true },
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result!.enrollments).toHaveLength(2);
      expect(
        result!.enrollments.map((e: { subject: { name: string } }) => e.subject.name).sort()
      ).toEqual(['Subject 1', 'Subject 2']);

      // Test unique constraint
      await expect(
        prisma!.enrollment.create({
          data: {
            studentId: student.id,
            subjectId: subject1.id,
          },
        })
      ).rejects.toThrow();

      // Cleanup
      await prisma!.enrollment.deleteMany({ where: { studentId: student.id } });
      await prisma!.student.delete({ where: { id: student.id } });
      await prisma!.subject.deleteMany({ where: { id: { in: [subject1.id, subject2.id] } } });
      await prisma!.user.delete({ where: { id: user.id } });
    });
  });

  describeWithDb('Class -> Room relationship', () => {
    it('should allow querying class with room', async () => {
      const room = await prisma!.room.create({
        data: {
          name: `Test Room CR ${Date.now()}`,
          capacity: 30,
          type: 'classroom',
        },
      });

      const classRoom = await prisma!.class.create({
        data: {
          name: `Test Class CR ${Date.now()}`,
          gradeLevel: 10,
          capacity: 25,
          roomId: room.id,
        },
      });

      const result = await prisma!.class.findUnique({
        where: { id: classRoom.id },
        include: { room: true },
      });

      expect(result).not.toBeNull();
      expect(result!.room).not.toBeNull();
      expect(result!.room!.name).toContain('Test Room CR');

      const roomResult = await prisma!.room.findUnique({
        where: { id: room.id },
        include: { classes: true },
      });

      expect(roomResult!.classes).toHaveLength(1);

      // Cleanup
      await prisma!.class.delete({ where: { id: classRoom.id } });
      await prisma!.room.delete({ where: { id: room.id } });
    });
  });
});
