import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [platformFeePercentage, setPlatformFeePercentage] = useState(10);
  const [minimumJobPriceCents, setMinimumJobPriceCents] = useState(5000);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    },
  });

  useEffect(() => {
    if (data) {
      setPlatformFeePercentage(data.platformFeePercentage);
      setMinimumJobPriceCents(data.minimumJobPriceCents);
    }
  }, [data]);

  const mutation = useMutation({
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
    onError: () => {
      toast.error('Failed to update global settings');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  if (isError) {
    toast.error('Failed to load settings');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Global Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage system-wide parameters like platform fees and minimum job prices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Platform Fee Percentage (%)</label>
          <div className="mt-1">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={platformFeePercentage}
              onChange={(e) => setPlatformFeePercentage(Number(e.target.value))}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">The percentage of the job payment that the platform retains as a fee.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Job Price (Cents)</label>
          <div className="mt-1">
            <input
              type="number"
              min="0"
              step="1"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={minimumJobPriceCents}
              onChange={(e) => setMinimumJobPriceCents(Number(e.target.value))}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            The minimum amount in cents (e.g., 5000 = R$ 50,00) that a company must offer to publish a job. 
            <strong> Current Equivalent: R$ {(minimumJobPriceCents / 100).toFixed(2).replace('.', ',')}</strong>
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
