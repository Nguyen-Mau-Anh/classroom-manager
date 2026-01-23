import { render, screen, fireEvent } from '@testing-library/react';

import { Subject } from '../../services/api/subjects';

import { SubjectList } from './SubjectList';

const mockSubjects: Subject[] = [
  {
    id: 'subject-1',
    code: 'MATH101',
    name: 'Mathematics I',
    description: 'Introduction to Mathematics',
    isMandatory: true,
    isActive: true,
    prerequisiteCount: 0,
    qualifiedTeacherCount: 5,
    enrollmentCount: 30,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subject-2',
    code: 'PHYS201',
    name: 'Physics II',
    description: 'Advanced Physics',
    isMandatory: false,
    isActive: true,
    prerequisiteCount: 2,
    qualifiedTeacherCount: 3,
    enrollmentCount: 15,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('SubjectList', () => {
  it('renders loading state', () => {
    const { container } = render(
      <SubjectList subjects={[]} onEdit={jest.fn()} onDelete={jest.fn()} isLoading={true} />,
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no subjects', () => {
    render(<SubjectList subjects={[]} onEdit={jest.fn()} onDelete={jest.fn()} isLoading={false} />);
    expect(screen.getByText('No subjects found')).toBeInTheDocument();
  });

  it('renders subjects table with data', () => {
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={jest.fn()} />);

    // Check table headers
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('Enrollments')).toBeInTheDocument();

    // Check subject data
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('Mathematics I')).toBeInTheDocument();
    expect(screen.getByText('PHYS201')).toBeInTheDocument();
    expect(screen.getByText('Physics II')).toBeInTheDocument();
  });

  it('displays mandatory badge correctly', () => {
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('displays prerequisite count badge', () => {
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('2 prereqs')).toBeInTheDocument();
  });

  it('displays qualified teacher count', () => {
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays enrollment count', () => {
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<SubjectList subjects={mockSubjects} onEdit={onEdit} onDelete={jest.fn()} />);

    const editButtons = screen.getAllByLabelText(/Edit/);
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockSubjects[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<SubjectList subjects={mockSubjects} onEdit={jest.fn()} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockSubjects[0]);
  });
});
