import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function JobDetailsCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const { user } = useAuth();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job-details-public', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      if (user && data.applications) {
        const hasApplied = data.applications.some((app: any) => app.userId === user.profileId);
        setApplied(hasApplied);
      }
      return data;
    },
    enabled: !!id && !!user
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/applications`, { jobId: id });
      return data;
    },
    onSuccess: () => {
      setApplied(true);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Falha ao se candidatar. Você já pode estar cadastrado.');
    }
  });

  if (isLoading) return <div className="min-h-screen bg-slate-950 p-12 text-slate-400">Carregando detalhes da vaga...</div>;
  if (!job) return <div className="min-h-screen bg-slate-950 p-12 text-slate-400">Vaga não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-6 text-slate-400 hover:text-white hover:bg-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <div className="bg-slate-900/50 p-8 md:p-10 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Briefcase className="h-40 w-40 text-indigo-500" />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{job.title}</h1>
            <p className="text-xl text-indigo-400 font-medium mb-6">{job.company?.name || 'Empresa Confidencial'}</p>

            <div className="flex flex-wrap gap-4 text-slate-300 mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><MapPin className="mr-2 h-4 w-4 text-indigo-500"/> {job.location}</div>
              <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><Briefcase className="mr-2 h-4 w-4 text-indigo-500"/> {job.contractType}</div>
              <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><Calendar className="mr-2 h-4 w-4 text-indigo-500"/> Expira em: {new Date(job.expirationDate).toLocaleDateString()}</div>
            </div>

            <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Sobre a Vaga</h3>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Requisitos</h3>
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
              {applied ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                  <CheckCircle className="mr-2 h-5 w-5" /> Candidatura enviada com sucesso!
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full md:w-auto text-lg px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
                  disabled={applyMutation.isPending}
                  onClick={() => applyMutation.mutate()}
                >
                  {applyMutation.isPending ? 'Enviando...' : 'Candidatar-se agora'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
