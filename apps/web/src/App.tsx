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
import MyApplications from './pages/candidate/MyApplications';
import CompanySettings from './pages/company/Settings';
import { AdminLayout } from './layouts/AdminLayout';
import { CandidateLayout } from './layouts/CandidateLayout';
import { CompanyLayout } from './layouts/CompanyLayout';
import { AdminRouteGuard } from './guards/AdminRouteGuard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminModeration from './pages/admin/Moderation';
import AdminDisputes from './pages/admin/Disputes';
import AdminSettings from './pages/admin/Settings';

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
      <Route element={<PrivateRoute allowedRoles={['USER', 'ADMIN']}><CandidateLayout /></PrivateRoute>}>
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetailsCandidate />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/settings" element={<CandidateSettings />} />
      </Route>
      
      {/* Rotas Empresa */}
      <Route element={<PrivateRoute allowedRoles={['COMPANY', 'ADMIN']}><CompanyLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/jobs/new" element={<NewJob />} />
        <Route path="/dashboard/jobs/:id" element={<JobDetails />} />
        <Route path="/dashboard/settings" element={<CompanySettings />} />
      </Route>
      
      {/* Rotas Admin */}
      <Route path="/admin" element={<AdminRouteGuard><AdminLayout /></AdminRouteGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="settings" element={<AdminSettings />} />
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
