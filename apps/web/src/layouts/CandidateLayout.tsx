import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, LogOut, User as UserIcon, Building2, Shield, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CandidateLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-indigo-400">
          Hubb Vagas
        </div>
        <div className="p-4 text-sm text-slate-400 border-b border-slate-800">
          Olá, <br/>
          <span className="font-semibold text-slate-200">{user?.email}</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/jobs"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/jobs') && location.pathname === '/jobs' ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Briefcase className="mr-3 h-5 w-5" /> Vagas
          </Link>
          <Link
            to="/my-applications"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/my-applications') ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ClipboardList className="mr-3 h-5 w-5" /> Minhas Candidaturas
          </Link>
          <Link
            to="/settings"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings') ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserIcon className="mr-3 h-5 w-5" /> Meu Perfil
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center px-4 py-3 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors"
            >
              <Shield className="mr-3 h-5 w-5" /> Painel Admin
            </Link>
          )}

          <div className="pt-6 mt-6 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Para Empresas</p>
            <Link
              to="/register"
              onClick={logout}
              className="flex items-center px-4 py-3 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Sair e criar conta de empresa"
            >
              <Building2 className="mr-3 h-5 w-5" /> Cadastrar Empresa
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut className="mr-3 h-5 w-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
};
