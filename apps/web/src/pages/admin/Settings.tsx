import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { AvatarUpload } from '../../components/ui/AvatarUpload';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'global'>('global');
  
  // Global settings state
  const [platformFeePercentage, setPlatformFeePercentage] = useState(10);
  const [minimumJobPriceCents, setMinimumJobPriceCents] = useState(5000);

  // Profile settings state
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: globalSettings, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    },
  });

  useEffect(() => {
    if (globalSettings) {
      setPlatformFeePercentage(globalSettings.platformFeePercentage);
      setMinimumJobPriceCents(globalSettings.minimumJobPriceCents);
    }
  }, [globalSettings]);

  const globalMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('/admin/settings', {
        platformFeePercentage,
        minimumJobPriceCents,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Global settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => toast.error('Failed to update global settings'),
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('/admin/me/profile', {
        name,
        avatarUrl,
      });
      return response.data;
    },
    onSuccess: () => toast.success('Profile updated successfully'),
    onError: () => toast.error('Failed to update profile'),
  });

  const handleGlobalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    globalMutation.mutate();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate();
  };

  if (isLoading) return <div className="text-gray-500">Loading settings...</div>;
  if (isError) toast.error('Failed to load settings');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded ${activeTab === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('global')}>Global Settings</button>
        <button className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('profile')}>My Profile</button>
      </div>

      {activeTab === 'global' && (
        <form onSubmit={handleGlobalSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform Fee Percentage (%)</label>
            <input type="number" step="0.01" min="0" max="100" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={platformFeePercentage} onChange={(e) => setPlatformFeePercentage(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Job Price (Cents)</label>
            <input type="number" min="0" step="1" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={minimumJobPriceCents} onChange={(e) => setMinimumJobPriceCents(Number(e.target.value))} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={globalMutation.isPending} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {globalMutation.isPending ? 'Saving...' : 'Save Global Settings'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          <AvatarUpload defaultImage={avatarUrl} onImageCompressed={setAvatarUrl} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin Name" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={profileMutation.isPending} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
