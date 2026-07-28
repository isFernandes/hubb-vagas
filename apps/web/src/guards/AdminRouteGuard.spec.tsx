import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRouteGuard } from './AdminRouteGuard';
import { useAuth } from '../contexts/AuthContext';

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AdminRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <div>Admin Content</div>
              </AdminRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders children if user is ADMIN', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN', profileId: '1' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects to / if user is not ADMIN', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'user@test.com', role: 'USER', profileId: '1' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('redirects to / if user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});
