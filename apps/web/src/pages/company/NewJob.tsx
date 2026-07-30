import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

import { toast } from 'sonner';

export default function NewJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('Diária');
  const [expirationDate, setExpirationDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [positionsAvailable, setPositionsAvailable] = useState('1');
  const [executionDate, setExecutionDate] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [durationHours, setDurationHours] = useState('');

  const createJobMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/jobs', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Vaga publicada com sucesso!');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      console.error(err);
      const message = err?.response?.data?.message;
      
      if (Array.isArray(message)) {
        // Zod validation errors usually come as an array
        message.forEach((msg: string) => toast.error(msg));
      } else {
        toast.error(message || 'Erro inesperado ao criar a vaga.');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converte vírgula para ponto e converte para centavos
    const amountStr = paymentAmount.replace(',', '.');
    const paymentAmountCents = Math.round(parseFloat(amountStr) * 100);

    const payload: any = {
      title,
      description,
      requirements,
      location,
      contractType,
      expiresAt: new Date(expirationDate).toISOString(),
      paymentAmountCents,
      positionsAvailable: parseInt(positionsAvailable, 10)
    };

    const hasAnyExecField = executionDate || executionTime || durationHours;
    const hasAllExecFields = executionDate && executionTime && durationHours;

    if (hasAnyExecField && !hasAllExecFields) {
      toast.error('Para informar a execução da vaga, preencha a Data, o Horário e a Duração.');
      return;
    }

    if (hasAllExecFields) {
      payload.executionDate = new Date(`${executionDate}T${executionTime}`).toISOString();
      payload.durationHours = parseInt(durationHours, 10);
    }

    createJobMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-slate-400 hover:text-white hover:bg-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Criar Nova Vaga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Título da Vaga</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-950/50 border-slate-700 text-white" placeholder="Ex: Motoboy para fim de semana, Auxiliar de Cozinha" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                <textarea 
                  id="description" 
                  required 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full min-h-[100px] p-3 rounded-md bg-slate-950/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Descreva as responsabilidades..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-slate-300">Requisitos</Label>
                <textarea 
                  id="requirements" 
                  required 
                  value={requirements} 
                  onChange={(e) => setRequirements(e.target.value)} 
                  className="w-full min-h-[100px] p-3 rounded-md bg-slate-950/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: CNH A em dia, experiência prévia, disponibilidade imediata..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">Localização</Label>
                  <Input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} className="bg-slate-950/50 border-slate-700 text-white" placeholder="Ex: Remoto, São Paulo - SP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType" className="text-slate-300">Tipo de Contrato</Label>
                  <select 
                    id="contractType" 
                    value={contractType} 
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full p-2.5 rounded-md bg-slate-950/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Diária">Diária</option>
                    <option value="Fim de Semana">Fim de Semana</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Temporário">Temporário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expirationDate" className="text-slate-300">Data de Expiração</Label>
                  <Input id="expirationDate" type="date" required value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="bg-slate-950/50 border-slate-700 text-white [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount" className="text-slate-300">Valor Ofertado (R$)</Label>
                  <Input 
                    id="paymentAmount" 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    required 
                    placeholder="Ex: 150.00"
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positionsAvailable" className="text-slate-300">Vagas Disponíveis</Label>
                  <Input 
                    id="positionsAvailable" 
                    type="number" 
                    min="1" 
                    required 
                    value={positionsAvailable} 
                    onChange={(e) => setPositionsAvailable(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="execDate" className="text-slate-300">Data de Execução (Opcional)</Label>
                  <Input 
                    id="execDate" 
                    type="date" 
                    value={executionDate} 
                    onChange={(e) => setExecutionDate(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-white [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="execTime" className="text-slate-300">Horário</Label>
                  <Input 
                    id="execTime" 
                    type="time" 
                    value={executionTime} 
                    onChange={(e) => setExecutionTime(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-white [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-300">Duração (Horas)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    min="1" 
                    value={durationHours} 
                    onChange={(e) => setDurationHours(e.target.value)} 
                    className="bg-slate-950/50 border-slate-700 text-white" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? 'Publicando...' : 'Publicar Vaga'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
