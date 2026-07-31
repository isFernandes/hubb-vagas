import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MyApplications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/me');
      return data;
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'REJECTED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'STANDBY': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Recusado';
      case 'STANDBY': return 'Fila de Espera';
      case 'APPLIED': return 'Enviado';
      case 'SCREENING': return 'Em Análise';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <header className="mb-10 pb-6 border-b border-slate-800">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Candidaturas</h1>
        <p className="text-slate-400 mt-1">Acompanhe o status das vagas que você se candidatou.</p>
      </header>

      <div className="max-w-4xl space-y-6">
        {isLoading ? (
          <div className="text-slate-400">Carregando suas candidaturas...</div>
        ) : applications?.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
            <h3 className="text-xl font-medium text-slate-300 mb-2">Você ainda não se candidatou a nenhuma vaga</h3>
            <p className="text-slate-500 mb-6">Explore as vagas disponíveis e dê o primeiro passo!</p>
            <Link to="/jobs">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Ver Vagas Disponíveis</Button>
            </Link>
          </div>
        ) : (
          applications?.map((app: any) => (
            <Card key={app.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                      <span className="text-sm text-slate-500">
                        Candidatou-se em {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{app.job.title}</h2>
                      <p className="text-indigo-400 font-medium text-sm">{app.job.company?.name || 'Empresa'}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-slate-500"/> {app.job.location}</span>
                      <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4 text-slate-500"/> {app.job.contractType}</span>
                      {app.job.executionDate && (
                        <span className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4 text-slate-500"/> 
                          {new Date(app.job.executionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Link to={`/jobs/${app.jobId}`}>
                      <Button variant="outline" className="w-full md:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Ver Vaga <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
