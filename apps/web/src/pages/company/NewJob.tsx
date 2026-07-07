import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('Diária');
  const [expirationDate, setExpirationDate] = useState('');

  const createJobMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/jobs', payload);
      return data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: any) => {
      console.error(err);
      const message = err?.response?.data?.message || 'Erro ao criar a vaga.';
      alert(typeof message === 'object' ? JSON.stringify(message) : message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate({
      title,
      description,
      requirements,
      location,
      contractType,
      expiresAt: new Date(expirationDate).toISOString()
    });
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

              <div className="space-y-2">
                <Label htmlFor="expirationDate" className="text-slate-300">Data de Expiração</Label>
                <Input id="expirationDate" type="date" required value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="bg-slate-950/50 border-slate-700 text-white [color-scheme:dark]" />
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
