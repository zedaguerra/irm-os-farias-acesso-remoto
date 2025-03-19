import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthForm } from './AuthForm';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

describe('AuthForm', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: null,
      loading: false,
      enable2FA: vi.fn()
    });
  });

  it('renders login form by default', () => {
    render(<AuthForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('switches to signup form when clicking signup link', () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/não tem uma conta/i));
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('calls signIn with correct credentials', async () => {
    const mockSignIn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: null,
      loading: false,
      enable2FA: vi.fn()
    });

    render(<AuthForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error message when login fails', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: null,
      loading: false,
      enable2FA: vi.fn()
    });

    render(<AuthForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});