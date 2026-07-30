import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, UserCircle, MapPin, Briefcase, Star, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewModal } from '@/components/ReviewModal';
import { ReportModal } from '@/components/ReportModal';
import { AlertTriangle } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportedAccountId, setReportedAccountId] = useState<string>('');

  const { data: job, isLoading } = useQuery({
    queryKey: ['job-details', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    },
    enabled: !!id
  });

  const approveMutation = useMutation({
    mutationFn: async (appId: string) => {
      const { data } = await api.patch(`/jobs/${id}/applications/${appId}/approve`);
      return data;
    },
    onSuccess: (data) => {
      if (data.checkoutRequired && data.init_point) {
        toast.success('Redirecionando para o pagamento...');
        window.location.href = data.init_point;
      } else {
        toast.success('Candidato aprovado e vaga encerrada com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['job-details', id] });
      }
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Falha ao aprovar candidato. A vaga pode já estar encerrada.';
      toast.error(message);
    }
  });

  if (isLoading) return <div className="min-h-screen bg-slate-950 p-12 text-slate-400">Carregando detalhes...</div>;
  if (!job) return <div className="min-h-screen bg-slate-950 p-12 text-slate-400">Vaga não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-slate-400 hover:text-white hover:bg-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${job.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : job.status === 'CLOSED_HIRED' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-300'}`}>
                  {job.status}
                </span>
              </div>

              <div className="mb-6 inline-block bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 px-4 py-1.5 rounded-full font-semibold text-sm">
                Vagas disponíveis: {Math.max(0, job.positionsAvailable - (job.applications?.filter((a: any) => a.status === 'APPROVED').length || 0))}
              </div>
              
              <div className="flex flex-wrap gap-4 text-slate-300 mb-8">
                <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><MapPin className="mr-2 h-4 w-4 text-indigo-500"/> {job.location}</div>
                <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><Briefcase className="mr-2 h-4 w-4 text-indigo-500"/> {job.contractType}</div>
                <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md"><Calendar className="mr-2 h-4 w-4 text-indigo-500"/> Expira em: {new Date(job.expirationDate || job.expiresAt).toLocaleDateString()}</div>
                {job.executionDate && (
                  <div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md border border-indigo-500/30">
                    <Clock className="mr-2 h-4 w-4 text-indigo-400"/> 
                    Execução: {new Date(job.executionDate).toLocaleDateString()} às {new Date(job.executionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {job.durationHours ? ` - Duração: ${job.durationHours}h` : ''}
                  </div>
                )}
              </div>

              <div className="space-y-6 text-slate-300 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Descrição da Vaga</h3>
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Requisitos</h3>
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white">Candidaturas ({job.applications?.length || 0})</h2>
            <div className="space-y-4">
              {job.applications?.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum candidato até o momento.</p>
              ) : (
                job.applications?.map((app: any) => (
                  <Card key={app.id} className="bg-slate-900 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md flex items-center gap-2 text-white">
                        <UserCircle className="h-5 w-5 text-slate-400"/>
                        {app.user?.name || 'Candidato'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <p className="text-sm text-slate-400 truncate">Status: <span className="font-medium text-slate-300">{app.status}</span></p>
                      
                      {job.status === 'PUBLISHED' && app.status !== 'APPROVED' && (
                        <Button 
                          onClick={() => approveMutation.mutate(app.id)}
                          disabled={approveMutation.isPending}
                          className="w-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar & Contratar
                        </Button>
                      )}

                      {job.status === 'CLOSED_HIRED' && app.status === 'APPROVED' && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => {
                              setSelectedAppId(app.id);
                              setIsReviewOpen(true);
                            }}
                            className="w-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Avaliar Candidato
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setReportedAccountId(app.user.account_id);
                              setIsReportOpen(true);
                            }}
                            className="w-full bg-red-600/10 text-red-400 hover:bg-red-600/20 border-red-500/30 hover:text-red-300"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Reportar Faltoso (No-Show)
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {isReviewOpen && (
        <ReviewModal 
          applicationId={selectedAppId} 
          onClose={() => setIsReviewOpen(false)} 
        />
      )}
      {isReportOpen && (
        <ReportModal 
          reportedAccountId={reportedAccountId} 
          reportedJobId={id!} 
          onClose={() => setIsReportOpen(false)} 
        />
      )}
    </div>
  );
}
