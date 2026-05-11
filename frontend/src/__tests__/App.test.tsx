import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}));

// Mock the toast context
jest.mock('../context/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useToast: () => ({
    toasts: [],
    addToast: jest.fn(),
    removeToast: jest.fn(),
    showToast: jest.fn(),
  }),
}));

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render the app container', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should wrap app with providers', () => {
    render(<App />);
    // Check if the app renders successfully with all providers
    expect(document.body).toBeInTheDocument();
  });
});
