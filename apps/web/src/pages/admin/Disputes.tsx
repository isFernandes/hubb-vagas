import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export default function AdminDisputes() {
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-disputes', page, statusFilter],
    queryFn: async () => {
      // Assuming GET /admin/disputes exists. In the backend we can use the reports endpoint or create a new one.
      // Since it's transactions, wait, the API was not implemented for GET /admin/disputes!
      // Let's fallback to just a placeholder or fetch using a generic endpoint if we need to.
      // Actually, since Disputes are Reports of type OTHER in our implementation (see disputes.service.ts line 28),
      // we can fetch Reports where type=OTHER or we should have a specific endpoint. 
      // I will just use GET /admin/reports?type=OTHER for now, assuming the API supports filtering by type, 
      // or just list all reports since disputes go to reports.
      const response = await api.get('/admin/reports', {
        params: { page, limit: 10, status: statusFilter || undefined },
      });
      return response.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'REFUND' | 'RELEASE' }) => {
      // Here id is the transactionId, but since we are showing reports, we need the transactionId.
      // Wait, if it's a report, we can resolve the report and that triggers the transaction resolution?
      // No, we created `POST /admin/disputes/:id/resolve` where :id is the transactionId!
      // But we don't have a GET /admin/disputes endpoint. We'd have to use the transaction ID.
      // To simplify this frontend mockup per the plan, let's just show a UI skeleton for it.
      await api.post(`/admin/disputes/${id}/resolve`, { action });
    },
    onSuccess: () => {
      toast.success('Disputa resolvida com sucesso!');
      refetch();
    },
    onError: () => {
      toast.error('Erro ao resolver disputa.');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Moderação de Disputas</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendentes</option>
            <option value="RESOLVED">Resolvidos</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data?.filter((r: any) => r.type === 'OTHER' && r.reportedTransactionId).map((report: any) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {report.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {report.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (report.reportedTransactionId) {
                              resolveMutation.mutate({ id: report.reportedTransactionId, action: 'REFUND' });
                            }
                          }}
                        >
                          Reembolsar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            if (report.reportedTransactionId) {
                              resolveMutation.mutate({ id: report.reportedTransactionId, action: 'RELEASE' });
                            }
                          }}
                        >
                          Liberar Pagamento
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.filter((r: any) => r.type === 'OTHER' && r.reportedTransactionId).length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma disputa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
