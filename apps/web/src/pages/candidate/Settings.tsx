import { useState } from 'react';
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CandidateSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [cpf, setCpf] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: () => toast.success('Perfil atualizado com sucesso!'),
    onError: () => toast.error('Erro ao atualizar perfil'),
  });

  const updatePassword = useMutation({
    mutationFn: (data: any) => api.patch('/accounts/me/password', data),
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: () => toast.error('Erro ao atualizar senha. Verifique sua senha atual.'),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações (Candidato)</h1>
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('profile')}>Perfil</button>
        <button className={`px-4 py-2 ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('security')}>Segurança</button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate({ name, bio, cpf }); }} className="flex flex-col gap-4">
          <input className="p-2 border" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
          <input className="p-2 border" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} />
          <textarea className="p-2 border" placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
          <button type="submit" className="bg-green-600 text-white p-2 rounded">Salvar Perfil</button>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={(e) => { e.preventDefault(); updatePassword.mutate({ currentPassword, newPassword }); }} className="flex flex-col gap-4">
          <input className="p-2 border" type="password" placeholder="Senha Atual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <input className="p-2 border" type="password" placeholder="Nova Senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <button type="submit" className="bg-red-600 text-white p-2 rounded">Atualizar Senha</button>
        </form>
      )}
    </div>
  );
}
