import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { LogOut, PlusCircle, Briefcase } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Pagamento recebido e candidato contratado com sucesso!');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    } else if (payment === 'failure') {
      toast.error('O pagamento foi recusado ou cancelado. A contratação não pôde ser concluída.');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['company-jobs', user?.profileId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs?companyId=${user?.profileId}`);
      return data;
    },
    enabled: !!user?.profileId,
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel da Empresa</h1>
          <p className="text-slate-400 mt-1">Gerencie suas vagas e candidatos ({user?.email})</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/jobs/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Vaga
            </Button>
          </Link>
          <Button variant="outline" onClick={logout} className="border-slate-800 hover:bg-slate-900 text-red-400 hover:text-red-300">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-slate-400 col-span-full">Carregando vagas...</p>
        ) : jobs?.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma vaga publicada ainda</h3>
            <p className="text-slate-400 mb-6">Comece publicando sua primeira vaga para encontrar talentos.</p>
            <Link to="/dashboard/jobs/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Vaga
              </Button>
            </Link>
          </div>
        ) : (
          jobs?.map((job: any) => (
            <Card key={job.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                <CardDescription className="text-slate-400">{job.location} • {job.contractType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : job.status === 'CLOSED_HIRED' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-300'}`}>
                    {job.status}
                  </span>
                </div>
                <Link to={`/dashboard/jobs/${job.id}`}>
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white">
                    Gerenciar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
