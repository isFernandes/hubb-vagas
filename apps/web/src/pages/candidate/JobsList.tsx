import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function JobsList() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState<number>(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['candidate-jobs', search, radius, latitude, longitude],
    queryFn: async () => {
      let endpoint = `/jobs?`;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (radius > 0 && latitude !== null && longitude !== null) {
        params.append('radius', radius.toString());
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
      }
      const { data } = await api.get(endpoint + params.toString());
      return data;
    },
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        if (radius === 0) setRadius(10); // default to 10km if none selected
        setIsLocating(false);
        toast.success('Localização obtida com sucesso!');
      },
      (error) => {
        console.error(error);
        toast.error('Não foi possível obter sua localização.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vagas Disponíveis</h1>
          <p className="text-slate-400 mt-1">Encontre seu próximo desafio, {user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <div className="max-w-xl mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
          <Input 
            type="text" 
            placeholder="Buscar por título ou descrição..." 
            className="pl-10 bg-slate-900/80 border-slate-700 text-white focus-visible:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <Button 
            variant="outline" 
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 w-full md:w-auto"
            onClick={handleGetLocation}
            disabled={isLocating}
          >
            <Navigation className={`mr-2 h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Localizando...' : (latitude !== null) ? 'Localização Ativa' : 'Buscar Próximas a Mim'}
          </Button>

          {latitude !== null && longitude !== null && (
            <div className="flex-1 flex items-center gap-3 w-full">
              <span className="text-sm text-slate-400 whitespace-nowrap">Raio: {radius}km</span>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={radius} 
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-slate-400 col-span-full">Procurando vagas...</p>
        ) : jobs?.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <h3 className="text-xl font-medium text-slate-300 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-slate-500">Tente ajustar sua busca.</p>
          </div>
        ) : (
          jobs?.map((job: any) => (
            <Card key={job.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2">{job.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="flex items-center bg-slate-800 px-2 py-1 rounded"><MapPin className="mr-1 h-3 w-3"/> {job.location}</span>
                  <span className="flex items-center bg-slate-800 px-2 py-1 rounded"><Briefcase className="mr-1 h-3 w-3"/> {job.contractType}</span>
                  {job.paymentAmountCents > 0 && (
                    <span className="flex items-center bg-slate-800 px-2 py-1 rounded text-emerald-400 font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(job.paymentAmountCents / 100)}
                    </span>
                  )}
                </div>
                <Link to={`/jobs/${job.id}`} className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                    Ver Detalhes
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
