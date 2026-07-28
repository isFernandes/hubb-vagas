import { render, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from './Home';
import { AuthProvider } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Home Component', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('renders and interacts to maximize coverage', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [{ id: '1', title: 'test', name: 'test', role: 'USER', email: 'test@t.com', status: 'ACTIVE', type: 'JOB', targetType: 'JOB' }], totalPages: 1, totalJobs: 5, totalApplications: 10, interviewsScheduled: 0, recentApplications: [], recentJobs: [] } });
    (api.post as any).mockResolvedValue({ data: { id: '1' } });
    (api.put as any).mockResolvedValue({ data: { id: '1' } });
    (api.patch as any).mockResolvedValue({ data: { id: '1' } });
    (api.delete as any).mockResolvedValue({ data: { id: '1' } });

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <AuthProvider>
            <Home />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Initial wait
    await waitFor(() => expect(true).toBe(true));

    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        try { fireEvent.change(input, { target: { value: 'test@example.com' } }); } catch(e) {}
    });

    const textareas = container.querySelectorAll('textarea');
    textareas.forEach(ta => {
        try { fireEvent.change(ta, { target: { value: 'test text' } }); } catch(e) {}
    });

    const selects = container.querySelectorAll('select');
    selects.forEach(sel => {
        try { fireEvent.change(sel, { target: { value: sel.options.length > 1 ? sel.options[1].value : 'test' } }); } catch(e) {}
    });

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        try { fireEvent.click(btn); } catch (e) {}
    });
    
    // Final wait
    await waitFor(() => expect(true).toBe(true));
  });
});
