import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldAlert, X } from 'lucide-react';

interface DisputeModalProps {
  transactionId: string;
  onClose: () => void;
}

export function DisputeModal({ transactionId, onClose }: DisputeModalProps) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const disputeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/disputes', {
        transactionId,
        reason,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Disputa aberta com sucesso. A administração analisará o caso.');
      queryClient.invalidateQueries({ queryKey: ['job-details'] });
      onClose();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Falha ao abrir disputa.';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('O motivo deve ter pelo menos 10 caracteres.');
      return;
    }
    disputeMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Abrir Disputa
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Utilize este canal para reportar problemas financeiros, falhas de serviço ou solicitar análise administrativa sobre um pagamento aprovado.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo da Disputa
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              placeholder="Descreva detalhadamente o motivo da disputa..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={disputeMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {disputeMutation.isPending ? 'Enviando...' : 'Confirmar Abertura'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
