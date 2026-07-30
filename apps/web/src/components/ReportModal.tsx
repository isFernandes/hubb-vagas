import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReportModalProps {
  reportedAccountId: string;
  reportedJobId: string;
  onClose: () => void;
}

export function ReportModal({ reportedAccountId, reportedJobId, onClose }: ReportModalProps) {
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async () => {
      await api.post('/reports', {
        type: 'NO_SHOW',
        description,
        reportedAccountId,
        reportedJobId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Reporte de ausência enviado com sucesso!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erro ao enviar reporte.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-red-400 mb-2">Reportar Ausência (No-Show)</h2>
        <p className="text-slate-400 text-sm mb-4">
          Utilize este formulário apenas se o candidato confirmou presença mas não compareceu para realizar o trabalho. Denúncias falsas podem resultar em suspensão da sua conta.
        </p>

        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-red-500 mb-6 min-h-[100px]"
          placeholder="Descreva brevemente o ocorrido..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={reportMutation.isPending} className="text-slate-400 hover:text-white">
            Cancelar
          </Button>
          <Button 
            onClick={() => reportMutation.mutate()} 
            disabled={reportMutation.isPending || description.trim().length === 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {reportMutation.isPending ? 'Enviando...' : 'Confirmar Reporte'}
          </Button>
        </div>
      </div>
    </div>
  );
}
