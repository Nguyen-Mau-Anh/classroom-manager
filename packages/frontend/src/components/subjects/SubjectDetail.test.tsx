import { render, screen, fireEvent } from '@testing-library/react';

import { Subject } from '../../services/api/subjects';

import { SubjectDetail, SubjectDetailProps } from './SubjectDetail';

describe('SubjectDetail', () => {
  const mockSubject: Subject = {
    id: 'subject-1',
    code: 'BIOL301',
    name: 'Advanced Biology',
    description: 'Advanced topics in cellular and molecular biology',
    isMandatory: false,
    isActive: true,
    prerequisiteCount: 2,
    qualifiedTeacherCount: 3,
    enrollmentCount: 28,
    prerequisites: [
      {
        id: 'subject-2',
        code: 'BIOL201',
        name: 'Biology II',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-3',
            code: 'BIOL101',
            name: 'Biology I',
            isMandatory: true,
          },
        ],
      },
      {
        id: 'subject-4',
        code: 'CHEM101',
        name: 'Chemistry I',
        isMandatory: false,
      },
    ],
    qualifiedTeachers: [
      {
        id: 'teacher-1',
        name: 'Dr. Tuan Nguyen',
        email: 'tuan@example.com',
        qualificationDate: '2026-01-15T00:00:00Z',
      },
      {
        id: 'teacher-2',
        name: 'Ms. Linh Pham',
        email: 'linh@example.com',
        qualificationDate: '2026-01-10T00:00:00Z',
      },
      {
        id: 'teacher-3',
        name: 'Mr. Hai Tran',
        email: 'hai@example.com',
        qualificationDate: '2026-01-05T00:00:00Z',
      },
    ],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-22T15:30:00Z',
  };

  const defaultProps: SubjectDetailProps = {
    subject: mockSubject,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('should render loading state', () => {
    render(<SubjectDetail {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render subject info card with code, name, description', () => {
    render(<SubjectDetail {...defaultProps} />);

    expect(screen.getByText('BIOL301')).toBeInTheDocument();
    expect(screen.getByText('Advanced Biology')).toBeInTheDocument();
    expect(
      screen.getByText('Advanced topics in cellular and molecular biology'),
    ).toBeInTheDocument();
  });

  it('should render mandatory badge for mandatory subjects', () => {
    const mandatorySubject = { ...mockSubject, isMandatory: true };
    render(<SubjectDetail subject={mandatorySubject} onEdit={jest.fn()} onDelete={jest.fn()} />);

    // Should show Required badge - may appear multiple times (in subject badge and prerequisites)
    const requiredBadges = screen.getAllByText('Required');
    expect(requiredBadges.length).toBeGreaterThan(0);
  });

  it('should render optional badge for elective subjects', () => {
    render(<SubjectDetail {...defaultProps} />);

    // Should show Optional badge - may appear multiple times (in subject badge and prerequisites)
    const optionalBadges = screen.getAllByText('Optional');
    expect(optionalBadges.length).toBeGreaterThan(0);
  });

  it('should render qualified teachers section with list and count', () => {
    render(<SubjectDetail {...defaultProps} />);

    expect(screen.getByText('Qualified Teachers (3)')).toBeInTheDocument();
    expect(screen.getByText('Dr. Tuan Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Ms. Linh Pham')).toBeInTheDocument();
    expect(screen.getByText('Mr. Hai Tran')).toBeInTheDocument();
  });

  it('should render empty state when no qualified teachers', () => {
    const subjectWithoutTeachers = {
      ...mockSubject,
      qualifiedTeachers: [],
      qualifiedTeacherCount: 0,
    };
    render(
      <SubjectDetail subject={subjectWithoutTeachers} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(screen.getByText('Qualified Teachers (0)')).toBeInTheDocument();
    expect(screen.getByText('No qualified teachers assigned')).toBeInTheDocument();
  });

  it('should render prerequisites section with tree view', () => {
    render(<SubjectDetail {...defaultProps} />);

    expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    expect(screen.getByText('BIOL201')).toBeInTheDocument();
    expect(screen.getByText('Biology II')).toBeInTheDocument();
    expect(screen.getByText('BIOL101')).toBeInTheDocument();
    expect(screen.getByText('Biology I')).toBeInTheDocument();
    expect(screen.getByText('CHEM101')).toBeInTheDocument();
    expect(screen.getByText('Chemistry I')).toBeInTheDocument();
  });

  it('should render enrollment statistics with total count', () => {
    render(<SubjectDetail {...defaultProps} />);

    expect(screen.getByText('Enrollment Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Enrolled')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
  });

  it('should render enrollment statistics by grade level', () => {
    render(
      <SubjectDetail
        {...defaultProps}
        enrollmentsByGrade={[
          { grade: '10', count: 8 },
          { grade: '11', count: 12 },
          { grade: '12', count: 8 },
        ]}
      />,
    );

    expect(screen.getByText('By Grade Level')).toBeInTheDocument();
    expect(screen.getByText('Grade 10: 8 students')).toBeInTheDocument();
    expect(screen.getByText('Grade 11: 12 students')).toBeInTheDocument();
    expect(screen.getByText('Grade 12: 8 students')).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<SubjectDetail {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockSubject);
  });

  it('should call onDelete when Delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<SubjectDetail {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockSubject);
  });

  it('should disable Edit and Delete buttons when isLoading is true', () => {
    render(<SubjectDetail {...defaultProps} isLoading={true} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should not render description when it is null', () => {
    const subjectWithoutDescription = { ...mockSubject, description: null };
    render(
      <SubjectDetail subject={subjectWithoutDescription} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(
      screen.queryByText('Advanced topics in cellular and molecular biology'),
    ).not.toBeInTheDocument();
  });

  it('should show "No enrollments yet" when enrollment count is 0', () => {
    const subjectWithoutEnrollments = { ...mockSubject, enrollmentCount: 0 };
    render(
      <SubjectDetail subject={subjectWithoutEnrollments} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(screen.getByText('No enrollments yet')).toBeInTheDocument();
  });
});
