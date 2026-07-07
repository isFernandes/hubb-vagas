import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>
      
      <div className="z-10 text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Hubb <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Vagas</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
          A plataforma premium que conecta talentos às melhores empresas de tecnologia. 
          Encontre seu próximo desafio ou divulgue sua vaga com estilo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Fazer Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
