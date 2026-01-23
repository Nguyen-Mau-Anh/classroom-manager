import { render, screen } from '@testing-library/react';

import { SubjectPrerequisite } from '../../services/api/subjects';

import { PrerequisiteTree } from './PrerequisiteTree';

describe('PrerequisiteTree', () => {
  it('renders empty state when no prerequisites', () => {
    render(<PrerequisiteTree prerequisites={[]} />);

    expect(screen.getByText('No prerequisites')).toBeInTheDocument();
  });

  it('renders single prerequisite', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('Mathematics I')).toBeInTheDocument();
  });

  it('renders multiple prerequisites at same level', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
      {
        id: 'subject-2',
        code: 'PHYS101',
        name: 'Physics I',
        isMandatory: false,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('Mathematics I')).toBeInTheDocument();
    expect(screen.getByText('PHYS101')).toBeInTheDocument();
    expect(screen.getByText('Physics I')).toBeInTheDocument();
  });

  it('renders nested prerequisites (prerequisite chain)', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-2',
        code: 'MATH201',
        name: 'Mathematics II',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Mathematics I',
            isMandatory: true,
          },
        ],
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Both levels should be visible
    expect(screen.getByText('MATH201')).toBeInTheDocument();
    expect(screen.getByText('Mathematics II')).toBeInTheDocument();
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('Mathematics I')).toBeInTheDocument();
  });

  it('renders deep prerequisite chain (3 levels)', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-3',
        code: 'MATH301',
        name: 'Mathematics III',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-2',
            code: 'MATH201',
            name: 'Mathematics II',
            isMandatory: true,
            prerequisites: [
              {
                id: 'subject-1',
                code: 'MATH101',
                name: 'Mathematics I',
                isMandatory: true,
              },
            ],
          },
        ],
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // All three levels should be visible
    expect(screen.getByText('MATH301')).toBeInTheDocument();
    expect(screen.getByText('MATH201')).toBeInTheDocument();
    expect(screen.getByText('MATH101')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} title="Required Prerequisites" />);

    expect(screen.getByText('Required Prerequisites')).toBeInTheDocument();
  });

  it('applies correct indentation for nested levels', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-2',
        code: 'MATH201',
        name: 'Mathematics II',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Mathematics I',
            isMandatory: true,
          },
        ],
      },
    ];

    const { container } = render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Check that nested items have additional indentation
    const nestedItems = container.querySelectorAll('[style*="margin-left"]');
    expect(nestedItems.length).toBeGreaterThan(0);
  });

  it('shows prerequisite count in title when provided', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
      {
        id: 'subject-2',
        code: 'PHYS101',
        name: 'Physics I',
        isMandatory: false,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    expect(screen.getByText(/Prerequisite Chain/i)).toBeInTheDocument();
  });

  // New tests for task #10 features
  it('color-codes mandatory prerequisites with red badge', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Check for red badge (Required badge)
    const requiredBadge = screen.getByText('Required');
    expect(requiredBadge).toBeInTheDocument();
    expect(requiredBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('color-codes elective prerequisites with blue badge', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'PHYS101',
        name: 'Physics I',
        isMandatory: false,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Check for blue badge (Optional badge)
    const optionalBadge = screen.getByText('Optional');
    expect(optionalBadge).toBeInTheDocument();
    expect(optionalBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('shows depth level indicator for each prerequisite', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-2',
        code: 'MATH201',
        name: 'Mathematics II',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Mathematics I',
            isMandatory: true,
          },
        ],
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Level 0 should not show level indicator
    expect(screen.queryByText('Level 0')).not.toBeInTheDocument();

    // Level 1 should show level indicator
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('highlights circular dependencies with error styling', () => {
    const circularPrerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
    ];

    const { container } = render(
      <PrerequisiteTree
        prerequisites={circularPrerequisites}
        circularDependencyIds={['subject-1']}
      />,
    );

    // Check for error styling on circular dependency node
    const nodes = container.querySelectorAll('[data-subject-id="subject-1"]');
    expect(nodes.length).toBeGreaterThan(0);

    // Check for red border and background
    const node = nodes[0];
    expect(node).toHaveClass('border-red-500', 'bg-red-50');
  });

  it('shows circular dependency warning message when detected', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
    ];

    render(
      <PrerequisiteTree prerequisites={prerequisites} circularDependencyIds={['subject-1']} />,
    );

    // Check for circular dependency warning message
    expect(screen.getByText(/Circular dependency detected/i)).toBeInTheDocument();
  });

  it('displays all depth levels correctly in multi-level tree', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-3',
        code: 'MATH301',
        name: 'Mathematics III',
        isMandatory: true,
        prerequisites: [
          {
            id: 'subject-2',
            code: 'MATH201',
            name: 'Mathematics II',
            isMandatory: true,
            prerequisites: [
              {
                id: 'subject-1',
                code: 'MATH101',
                name: 'Mathematics I',
                isMandatory: true,
              },
            ],
          },
        ],
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Check all depth levels are shown
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
  });

  it('shows mixed mandatory and elective prerequisites with correct colors', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
      {
        id: 'subject-2',
        code: 'PHYS101',
        name: 'Physics I',
        isMandatory: false,
      },
    ];

    render(<PrerequisiteTree prerequisites={prerequisites} />);

    // Check for both types of badges
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('highlights multiple circular dependencies', () => {
    const prerequisites: SubjectPrerequisite[] = [
      {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics I',
        isMandatory: true,
      },
      {
        id: 'subject-2',
        code: 'PHYS101',
        name: 'Physics I',
        isMandatory: false,
      },
    ];

    const { container } = render(
      <PrerequisiteTree
        prerequisites={prerequisites}
        circularDependencyIds={['subject-1', 'subject-2']}
      />,
    );

    // Check both nodes have error styling
    const node1 = container.querySelector('[data-subject-id="subject-1"]');
    const node2 = container.querySelector('[data-subject-id="subject-2"]');

    expect(node1).toHaveClass('border-red-500', 'bg-red-50');
    expect(node2).toHaveClass('border-red-500', 'bg-red-50');
  });
});
