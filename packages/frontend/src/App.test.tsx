import { fireEvent, render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('renders default title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Classroom Manager');
  });

  it('renders custom title', () => {
    render(<App title="Custom Title" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
  });

  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to the Classroom Management System')).toBeInTheDocument();
  });

  it('starts counter at zero', () => {
    render(<App />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('increments counter when + button is clicked', () => {
    render(<App />);
    const incrementButton = screen.getByRole('button', { name: 'Increment' });

    fireEvent.click(incrementButton);
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(incrementButton);
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('decrements counter when - button is clicked', () => {
    render(<App />);
    const decrementButton = screen.getByRole('button', { name: 'Decrement' });

    fireEvent.click(decrementButton);
    expect(screen.getByTestId('count')).toHaveTextContent('-1');
  });

  it('handles multiple increment and decrement operations', () => {
    render(<App />);
    const incrementButton = screen.getByRole('button', { name: 'Increment' });
    const decrementButton = screen.getByRole('button', { name: 'Decrement' });

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});
