import { useState } from 'react';

/**
 * Props for the App component.
 */
export interface AppProps {
  title?: string;
}

/**
 * Main application component.
 */
export function App({ title = 'Classroom Manager' }: AppProps) {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCount((prev) => prev - 1);
  };

  return (
    <div className="app">
      <h1>{title}</h1>
      <p>Welcome to the Classroom Management System</p>
      <div className="counter">
        <button onClick={handleDecrement} aria-label="Decrement">
          -
        </button>
        <span data-testid="count">{count}</span>
        <button onClick={handleIncrement} aria-label="Increment">
          +
        </button>
      </div>
    </div>
  );
}
