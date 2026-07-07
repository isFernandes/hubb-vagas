import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      // Decode JWT slightly or rely on backend returning user data
      // For this project, assuming backend returns { access_token, user: { id, email, role, profileId } }
      login(data.access_token, data.user);
    },
    onError: () => {
      setErrorMsg('Credenciais inválidas. Tente novamente.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>
      <Card className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Bem-vindo(a) de volta</CardTitle>
          <CardDescription className="text-slate-400">
            Acesse sua conta no Hubb Vagas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                className="bg-slate-950/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMsg && (
              <p className="text-sm text-red-500 text-center">{errorMsg}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-slate-800 pt-4">
          <div className="text-center text-sm text-slate-400">
            Ainda não tem uma conta?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
