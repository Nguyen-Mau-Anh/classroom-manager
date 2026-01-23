import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { Toast, ToastProvider, useToast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Toast types', () => {
    it('should render success toast with green background', () => {
      const onClose = jest.fn();
      render(<Toast message="Success message" type="success" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-500');
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should render error toast with red background', () => {
      const onClose = jest.fn();
      render(<Toast message="Error message" type="error" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-500');
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should render info toast with blue background', () => {
      const onClose = jest.fn();
      render(<Toast message="Info message" type="info" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-blue-500');
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should render warning toast with yellow/orange background', () => {
      const onClose = jest.fn();
      render(<Toast message="Warning message" type="warning" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-500');
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });

  describe('Toast behavior', () => {
    it('should call onClose after duration expires', async () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} duration={100} />);

      expect(onClose).not.toHaveBeenCalled();

      await waitFor(
        () => {
          expect(onClose).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 },
      );
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ToastProvider and useToast', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button onClick={() => showToast('Success toast', 'success')}>Show Success</button>
          <button onClick={() => showToast('Error toast', 'error')}>Show Error</button>
          <button onClick={() => showToast('Info toast', 'info')}>Show Info</button>
          <button onClick={() => showToast('Warning toast', 'warning')}>Show Warning</button>
        </div>
      );
    };

    it('should show success toast when showToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByText('Show Success');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Success toast')).toBeInTheDocument();
      });
    });

    it('should show error toast when showToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByText('Show Error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Error toast')).toBeInTheDocument();
      });
    });

    it('should show info toast when showToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByText('Show Info');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Info toast')).toBeInTheDocument();
      });
    });

    it('should show warning toast when showToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByText('Show Warning');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Warning toast')).toBeInTheDocument();
      });
    });

    it('should show multiple toasts simultaneously', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));

      await waitFor(() => {
        expect(screen.getByText('Success toast')).toBeInTheDocument();
        expect(screen.getByText('Error toast')).toBeInTheDocument();
      });
    });
  });

  describe('Subject Management Toast Messages', () => {
    const TestSubjectComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button onClick={() => showToast('Subject created successfully', 'success')}>
            Create Subject
          </button>
          <button onClick={() => showToast('Teachers assigned to subject', 'success')}>
            Assign Teachers
          </button>
          <button onClick={() => showToast('Subject code already exists', 'error')}>
            Duplicate Code
          </button>
          <button
            onClick={() => showToast('Cannot delete subject with active enrollments', 'warning')}
          >
            Delete With Enrollments
          </button>
        </div>
      );
    };

    it('should show "Subject created successfully" success toast', async () => {
      render(
        <ToastProvider>
          <TestSubjectComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Create Subject'));

      await waitFor(() => {
        expect(screen.getByText('Subject created successfully')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-500');
    });

    it('should show "Teachers assigned to subject" success toast', async () => {
      render(
        <ToastProvider>
          <TestSubjectComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Assign Teachers'));

      await waitFor(() => {
        expect(screen.getByText('Teachers assigned to subject')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-500');
    });

    it('should show "Subject code already exists" error toast', async () => {
      render(
        <ToastProvider>
          <TestSubjectComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Duplicate Code'));

      await waitFor(() => {
        expect(screen.getByText('Subject code already exists')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-500');
    });

    it('should show "Cannot delete subject with active enrollments" warning toast', async () => {
      render(
        <ToastProvider>
          <TestSubjectComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Delete With Enrollments'));

      await waitFor(() => {
        expect(
          screen.getByText('Cannot delete subject with active enrollments'),
        ).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-500');
    });
  });
});
