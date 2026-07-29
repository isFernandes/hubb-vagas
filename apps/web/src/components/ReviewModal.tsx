import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  applicationId: string;
  onClose: () => void;
}

export function ReviewModal({ applicationId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/reviews/application/${applicationId}`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      alert('Avaliação enviada com sucesso!');
      onClose();
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Erro ao enviar avaliação.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Avaliar Experiência</h2>
        
        <div className="flex gap-2 mb-6 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Star className="w-8 h-8 fill-current" />
            </button>
          ))}
        </div>

        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 mb-6 min-h-[100px]"
          placeholder="Conte como foi sua experiência... (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={reviewMutation.isPending} className="text-slate-400 hover:text-white">
            Cancelar
          </Button>
          <Button 
            onClick={() => reviewMutation.mutate()} 
            disabled={reviewMutation.isPending || rating === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {reviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      </div>
    </div>
  );
}
