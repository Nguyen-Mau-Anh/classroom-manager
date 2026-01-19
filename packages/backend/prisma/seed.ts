import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Use transaction for atomic seeding - all or nothing
  await prisma.$transaction(async (tx) => {
    // Clean up existing data (in reverse dependency order)
    await tx.notification.deleteMany();
    await tx.teacherAbsence.deleteMany();
    await tx.enrollment.deleteMany();
    await tx.timeSlot.deleteMany();
    await tx.teacherQualification.deleteMany();
    await tx.student.deleteMany();
    await tx.teacher.deleteMany();
    await tx.user.deleteMany();
    await tx.class.deleteMany();
    await tx.room.deleteMany();
    await tx.subject.deleteMany();

    console.log('Creating rooms...');
    // Create Rooms
    const room101 = await tx.room.create({
      data: { name: 'Room 101', capacity: 30, type: 'classroom' },
    });
    const room102 = await tx.room.create({
      data: { name: 'Room 102', capacity: 30, type: 'classroom' },
    });
    const room103 = await tx.room.create({
      data: { name: 'Room 103', capacity: 25, type: 'classroom' },
    });
    const scienceLab = await tx.room.create({
      data: { name: 'Science Lab', capacity: 20, type: 'lab' },
    });
    const gymnasium = await tx.room.create({
      data: { name: 'Gymnasium', capacity: 50, type: 'gym' },
    });

    console.log('Creating subjects...');
    // Create Subjects
    const math = await tx.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Basic mathematics',
        isMandatory: true,
      },
    });
    const english = await tx.subject.create({
      data: {
        name: 'English',
        code: 'ENG101',
        description: 'English language and literature',
        isMandatory: true,
      },
    });
    const science = await tx.subject.create({
      data: {
        name: 'Science',
        code: 'SCI101',
        description: 'General science',
        isMandatory: true,
      },
    });
    const history = await tx.subject.create({
      data: {
        name: 'History',
        code: 'HIST101',
        description: 'World history',
        isMandatory: false,
      },
    });
    const pe = await tx.subject.create({
      data: {
        name: 'Physical Education',
        code: 'PE101',
        description: 'Physical fitness and sports',
        isMandatory: true,
      },
    });

    // Create Advanced Math with prerequisite
    const advancedMath = await tx.subject.create({
      data: {
        name: 'Advanced Mathematics',
        code: 'MATH201',
        description: 'Advanced topics in mathematics',
        isMandatory: false,
        prerequisites: {
          connect: [{ id: math.id }],
        },
      },
    });

    console.log('Creating classes...');
    // Create Classes
    const grade10A = await tx.class.create({
      data: {
        name: 'Grade 10A',
        gradeLevel: 10,
        capacity: 30,
        roomId: room101.id,
      },
    });
    // Grade 10B - used for demonstrating multiple classes
    await tx.class.create({
      data: {
        name: 'Grade 10B',
        gradeLevel: 10,
        capacity: 30,
        roomId: room102.id,
      },
    });
    const grade11A = await tx.class.create({
      data: {
        name: 'Grade 11A',
        gradeLevel: 11,
        capacity: 25,
        roomId: room103.id,
      },
    });

    console.log('Creating admin user...');
    // Create Admin User
    await tx.user.create({
      data: {
        email: 'admin@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-admin', // Placeholder hash
        role: UserRole.ADMIN,
      },
    });

    console.log('Creating teachers...');
    // Create Teachers
    const teacherUser1 = await tx.user.create({
      data: {
        email: 'linh.nguyen@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-teacher1',
        role: UserRole.TEACHER,
      },
    });
    const teacher1 = await tx.teacher.create({
      data: {
        userId: teacherUser1.id,
        name: 'Ms. Linh Nguyen',
        phone: '0901234567',
        qualifications: {
          create: [{ subjectId: science.id }, { subjectId: math.id }],
        },
      },
    });

    const teacherUser2 = await tx.user.create({
      data: {
        email: 'tuan.tran@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-teacher2',
        role: UserRole.TEACHER,
      },
    });
    const teacher2 = await tx.teacher.create({
      data: {
        userId: teacherUser2.id,
        name: 'Mr. Tuan Tran',
        phone: '0907654321',
        qualifications: {
          create: [{ subjectId: english.id }, { subjectId: history.id }],
        },
      },
    });

    const teacherUser3 = await tx.user.create({
      data: {
        email: 'hanh.le@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-teacher3',
        role: UserRole.TEACHER,
      },
    });
    const teacher3 = await tx.teacher.create({
      data: {
        userId: teacherUser3.id,
        name: 'Ms. Hanh Le',
        phone: '0909876543',
        qualifications: {
          create: [
            { subjectId: pe.id },
            { subjectId: math.id },
            { subjectId: advancedMath.id },
          ],
        },
      },
    });

    console.log('Creating students...');
    // Create Students
    const studentUser1 = await tx.user.create({
      data: {
        email: 'minh.student@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-student1',
        role: UserRole.STUDENT,
      },
    });
    await tx.student.create({
      data: {
        userId: studentUser1.id,
        name: 'Minh Vo',
        gradeLevel: 10,
        classId: grade10A.id,
        enrollments: {
          create: [
            { subjectId: math.id },
            { subjectId: english.id },
            { subjectId: science.id },
            { subjectId: pe.id },
          ],
        },
      },
    });

    const studentUser2 = await tx.user.create({
      data: {
        email: 'hoa.student@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-student2',
        role: UserRole.STUDENT,
      },
    });
    await tx.student.create({
      data: {
        userId: studentUser2.id,
        name: 'Hoa Pham',
        gradeLevel: 10,
        classId: grade10A.id,
        enrollments: {
          create: [
            { subjectId: math.id },
            { subjectId: english.id },
            { subjectId: science.id },
            { subjectId: history.id },
            { subjectId: pe.id },
          ],
        },
      },
    });

    const studentUser3 = await tx.user.create({
      data: {
        email: 'nam.student@school.edu',
        passwordHash: '$2b$10$placeholder-hash-for-student3',
        role: UserRole.STUDENT,
      },
    });
    await tx.student.create({
      data: {
        userId: studentUser3.id,
        name: 'Nam Hoang',
        gradeLevel: 11,
        classId: grade11A.id,
        enrollments: {
          create: [
            { subjectId: math.id },
            { subjectId: advancedMath.id },
            { subjectId: english.id },
            { subjectId: science.id },
          ],
        },
      },
    });

    console.log('Creating time slots...');
    // Create TimeSlots (sample schedule)
    // Monday Math for Grade 10A
    await tx.timeSlot.create({
      data: {
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:30',
        classId: grade10A.id,
        subjectId: math.id,
        teacherId: teacher1.id,
        roomId: room101.id,
      },
    });

    // Monday English for Grade 10A
    await tx.timeSlot.create({
      data: {
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '11:30',
        classId: grade10A.id,
        subjectId: english.id,
        teacherId: teacher2.id,
        roomId: room101.id,
      },
    });

    // Monday PE for Grade 10A
    await tx.timeSlot.create({
      data: {
        dayOfWeek: 1, // Monday
        startTime: '14:00',
        endTime: '15:30',
        classId: grade10A.id,
        subjectId: pe.id,
        teacherId: teacher3.id,
        roomId: gymnasium.id,
      },
    });

    // Tuesday Science for Grade 10A (in lab)
    await tx.timeSlot.create({
      data: {
        dayOfWeek: 2, // Tuesday
        startTime: '08:00',
        endTime: '09:30',
        classId: grade10A.id,
        subjectId: science.id,
        teacherId: teacher1.id,
        roomId: scienceLab.id,
      },
    });

    console.log('Creating sample notifications...');
    // Create sample notification
    await tx.notification.create({
      data: {
        userId: studentUser1.id,
        type: 'SCHEDULE_CHANGE',
        title: 'Room Change',
        message: 'Your Science class has been moved to the Science Lab.',
        isRead: false,
      },
    });
  });

  console.log('Seed completed successfully!');
  console.log('Summary:');
  console.log('- 5 Rooms created');
  console.log('- 6 Subjects created (including Advanced Math with prerequisite)');
  console.log('- 3 Classes created');
  console.log('- 1 Admin user created');
  console.log('- 3 Teachers created with qualifications');
  console.log('- 3 Students created with enrollments');
  console.log('- 4 TimeSlots created');
  console.log('- 1 Sample notification created');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
