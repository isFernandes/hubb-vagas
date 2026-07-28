import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/company/Dashboard';
import NewJob from './pages/company/NewJob';
import JobDetails from './pages/company/JobDetails';

import JobsList from './pages/candidate/JobsList';
import JobDetailsCandidate from './pages/candidate/JobDetailsCandidate';
import CandidateSettings from './pages/candidate/Settings';
import CompanySettings from './pages/company/Settings';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminRouteGuard } from './guards/AdminRouteGuard';
import AdminDashboard from './pages/admin/Dashboard';

import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role.toUpperCase())) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas Candidato */}
      <Route path="/jobs" element={<PrivateRoute allowedRoles={['USER', 'ADMIN']}><JobsList /></PrivateRoute>} />
      <Route path="/jobs/:id" element={<PrivateRoute allowedRoles={['USER', 'ADMIN']}><JobDetailsCandidate /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute allowedRoles={['USER']}><CandidateSettings /></PrivateRoute>} />
      
      {/* Rotas Empresa */}
      <Route path="/dashboard" element={<PrivateRoute allowedRoles={['COMPANY', 'ADMIN']}><Dashboard /></PrivateRoute>} />
      <Route path="/dashboard/jobs/new" element={<PrivateRoute allowedRoles={['COMPANY', 'ADMIN']}><NewJob /></PrivateRoute>} />
      <Route path="/dashboard/jobs/:id" element={<PrivateRoute allowedRoles={['COMPANY', 'ADMIN']}><JobDetails /></PrivateRoute>} />
      <Route path="/dashboard/settings" element={<PrivateRoute allowedRoles={['COMPANY']}><CompanySettings /></PrivateRoute>} />
      
      {/* Rotas Admin */}
      <Route path="/admin" element={<AdminRouteGuard><AdminLayout /></AdminRouteGuard>}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
