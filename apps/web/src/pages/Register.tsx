import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'USER' | 'COMPANY'>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Perfil User
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Perfil Company
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        email,
        password,
        role: role === 'USER' ? 'USER' : 'COMPANY',
        ...(role === 'USER' ? { name, cpf: cpf.replace(/\D/g, ''), bio: resumeUrl, contact: '' } : { name: companyName, cnpj, contact: '' })
      };
      const { data } = await api.post('/accounts', payload);
      return data;
    },
    onSuccess: () => {
      navigate('/login');
    },
    onError: (error: any) => {
      setErrorMsg(error?.response?.data?.message || 'Erro ao registrar. Verifique os dados.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 py-12">
      <Card className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Criar Conta</CardTitle>
          <CardDescription className="text-slate-400">
            Junte-se à plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex gap-4 p-1 bg-slate-950/50 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'USER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sou Candidato
              </button>
              <button
                type="button"
                onClick={() => setRole('COMPANY')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'COMPANY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sou Empresa
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
            </div>

            {role === 'USER' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Nome Completo</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-slate-200">CPF</Label>
                  <Input id="cpf" required type="text" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl" className="text-slate-200">Resumo ou Links (Opcional)</Label>
                  <Input id="resumeUrl" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" placeholder="Ex: Trabalhei 2 anos como garçom..." />
                </div>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-200">Nome da Empresa</Label>
                  <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-slate-200">CNPJ</Label>
                  <Input id="cnpj" required value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500" />
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-sm text-red-500 text-center">{errorMsg}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-slate-800 pt-4">
          <div className="text-center text-sm text-slate-400">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Entrar
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
