import React, { useState } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { AlertTriangle, Bell, Info, Check, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertsPanelProps {
  deviceId: string;
}

export function AlertsPanel({ deviceId }: AlertsPanelProps) {
  const { alerts, loading, markAsRead, clearAlert } = useAlerts(deviceId);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'medium' | 'low'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.read;
    return alert.severity === filter;
  });

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className={`h-5 w-5 ${severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleExportAlerts = () => {
    const headers = ['Tipo', 'Mensagem', 'Severidade', 'Data', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredAlerts.map((alert) => [
        alert.type,
        `"${alert.message}"`,
        alert.severity,
        new Date(alert.created_at).toLocaleString(),
        alert.read ? 'Lido' : 'Não lido'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Relatório exportado com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Alertas</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportAlerts}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Não lidos
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'high'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Alta Prioridade
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Média Prioridade
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'low'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Baixa Prioridade
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start justify-between p-4 rounded-lg ${
                alert.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type, alert.severity)}
                <div>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!alert.read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Marcar como lido"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => clearAlert(alert.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Remover alerta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum alerta encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}