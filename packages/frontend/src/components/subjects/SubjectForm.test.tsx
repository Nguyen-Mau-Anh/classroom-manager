import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Subject } from '../../services/api/subjects';

import { SubjectForm, SubjectFormProps } from './SubjectForm';

describe('SubjectForm', () => {
  const mockSubjects: Subject[] = [
    {
      id: 'subject-1',
      code: 'MATH101',
      name: 'Mathematics I',
      description: 'Basic mathematics',
      isMandatory: true,
      isActive: true,
      prerequisiteCount: 0,
      qualifiedTeacherCount: 5,
      enrollmentCount: 30,
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    },
    {
      id: 'subject-2',
      code: 'PHYS101',
      name: 'Physics I',
      description: 'Basic physics',
      isMandatory: false,
      isActive: true,
      prerequisiteCount: 0,
      qualifiedTeacherCount: 3,
      enrollmentCount: 25,
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    },
  ];

  const mockTeachers = [
    { id: 'teacher-1', name: 'Dr. Tuan Nguyen', email: 'tuan@example.com' },
    { id: 'teacher-2', name: 'Ms. Linh Pham', email: 'linh@example.com' },
  ];

  const defaultProps: SubjectFormProps = {
    subjects: mockSubjects,
    teachers: mockTeachers,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create mode form with all fields', () => {
    render(<SubjectForm {...defaultProps} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mandatory/i)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const mockSubmit = jest.fn();
    render(<SubjectForm {...defaultProps} onSubmit={mockSubmit} />);

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Code is required')).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('validates code format (uppercase alphanumeric with hyphens)', async () => {
    const mockSubmit = jest.fn();
    render(<SubjectForm {...defaultProps} onSubmit={mockSubmit} />);

    const codeInput = screen.getByLabelText(/Code/i);
    fireEvent.change(codeInput, { target: { value: 'invalid code!' } });

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Code must be uppercase/i)).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data in create mode', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SubjectForm {...defaultProps} onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Advanced Biology' },
    });
    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'BIOL301' } });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Advanced topics in biology' },
    });

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in biology',
        isMandatory: false,
        prerequisiteIds: [],
        qualifiedTeacherIds: [],
      });
    });
  });

  it('toggles mandatory switch', () => {
    render(<SubjectForm {...defaultProps} />);

    const mandatoryToggle = screen.getByLabelText(/Mandatory/i) as HTMLInputElement;
    expect(mandatoryToggle.checked).toBe(false);

    fireEvent.click(mandatoryToggle);
    expect(mandatoryToggle.checked).toBe(true);

    fireEvent.click(mandatoryToggle);
    expect(mandatoryToggle.checked).toBe(false);
  });

  it('allows selecting prerequisites from multi-select', () => {
    render(<SubjectForm {...defaultProps} />);

    const prerequisiteCheckbox = screen.getByLabelText(/Mathematics I \(MATH101\)/i) as HTMLInputElement;

    expect(prerequisiteCheckbox.checked).toBe(false);
    fireEvent.click(prerequisiteCheckbox);
    expect(prerequisiteCheckbox.checked).toBe(true);
  });

  it('allows selecting multiple prerequisites', () => {
    render(<SubjectForm {...defaultProps} />);

    const math101Checkbox = screen.getByLabelText(/Mathematics I \(MATH101\)/i) as HTMLInputElement;
    const phys101Checkbox = screen.getByLabelText(/Physics I \(PHYS101\)/i) as HTMLInputElement;

    fireEvent.click(math101Checkbox);
    fireEvent.click(phys101Checkbox);

    expect(math101Checkbox.checked).toBe(true);
    expect(phys101Checkbox.checked).toBe(true);
  });

  it('allows selecting qualified teachers from multi-select', () => {
    render(<SubjectForm {...defaultProps} />);

    const teacherCheckbox = screen.getByLabelText(/Dr\. Tuan Nguyen/i) as HTMLInputElement;

    expect(teacherCheckbox.checked).toBe(false);
    fireEvent.click(teacherCheckbox);
    expect(teacherCheckbox.checked).toBe(true);
  });

  it('pre-fills form fields in edit mode', () => {
    const editSubject: Subject = {
      id: 'subject-edit',
      code: 'BIOL301',
      name: 'Advanced Biology',
      description: 'Advanced topics',
      isMandatory: true,
      isActive: true,
      prerequisiteCount: 1,
      qualifiedTeacherCount: 2,
      enrollmentCount: 15,
      prerequisites: [mockSubjects[0]],
      qualifiedTeachers: [{ id: 'teacher-1', name: 'Dr. Tuan Nguyen', email: 'tuan@example.com' }],
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    };

    render(<SubjectForm {...defaultProps} subject={editSubject} />);

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Advanced Biology');
    expect(screen.getByLabelText(/Code/i)).toHaveValue('BIOL301');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Advanced topics');
    expect((screen.getByLabelText(/Mandatory/i) as HTMLInputElement).checked).toBe(true);

    // Check prerequisites are pre-selected
    const math101Checkbox = screen.getByLabelText(/Mathematics I \(MATH101\)/i) as HTMLInputElement;
    expect(math101Checkbox.checked).toBe(true);

    // Check qualified teachers are pre-selected
    const teacherCheckbox = screen.getByLabelText(/Dr\. Tuan Nguyen/i) as HTMLInputElement;
    expect(teacherCheckbox.checked).toBe(true);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockCancel = jest.fn();
    render(<SubjectForm {...defaultProps} onCancel={mockCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('disables form fields when isLoading is true', () => {
    render(<SubjectForm {...defaultProps} isLoading={true} />);

    expect(screen.getByLabelText(/Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Code/i)).toBeDisabled();
    expect(screen.getByLabelText(/Description/i)).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows empty state when no prerequisites available', () => {
    render(<SubjectForm {...defaultProps} subjects={[]} />);

    expect(screen.getByText('No subjects available for prerequisites')).toBeInTheDocument();
  });

  it('shows empty state when no teachers available', () => {
    render(<SubjectForm {...defaultProps} teachers={[]} />);

    expect(screen.getByText('No teachers available')).toBeInTheDocument();
  });

  it('filters out current subject from prerequisites list in edit mode', () => {
    const editSubject: Subject = {
      id: 'subject-edit',
      code: 'BIOL301',
      name: 'Advanced Biology',
      description: 'Advanced topics',
      isMandatory: true,
      isActive: true,
      prerequisiteCount: 0,
      qualifiedTeacherCount: 0,
      enrollmentCount: 0,
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    };

    const subjectsWithCurrent = [...mockSubjects, editSubject];

    render(<SubjectForm {...defaultProps} subject={editSubject} subjects={subjectsWithCurrent} />);

    // Current subject should not appear in prerequisites list
    expect(screen.queryByLabelText(/Advanced Biology \(BIOL301\)/i)).not.toBeInTheDocument();
    // Other subjects should still appear
    expect(screen.getByLabelText(/Mathematics I \(MATH101\)/i)).toBeInTheDocument();
  });
});
