import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Key, Shield, Bell, Lock } from 'lucide-react';
import { TwoFactorAuthModal } from './TwoFactorAuthModal';

export function SecuritySettings() {
  const { user } = useAuth();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [notifications, setNotifications] = useState({
    security: true,
    login: true,
    updates: false
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Configurações de Segurança
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-800">
                  Autenticação de Dois Fatores
                </h3>
                <p className="text-sm text-gray-500">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
            </div>
            <button
              onClick={() => setShow2FAModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Configurar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-800">
                  Notificações de Segurança
                </h3>
                <p className="text-sm text-gray-500">
                  Gerencie suas preferências de notificação
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.security}
                  onChange={() => handleNotificationChange('security')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Alertas de segurança
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.login}
                  onChange={() => handleNotificationChange('login')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Novos logins
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={() => handleNotificationChange('updates')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Atualizações de segurança
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-800">
                  Dispositivos Conectados
                </h3>
                <p className="text-sm text-gray-500">
                  Gerencie dispositivos com acesso à sua conta
                </p>
              </div>
            </div>
            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              Gerenciar
            </button>
          </div>
        </div>
      </div>

      {show2FAModal && <TwoFactorAuthModal onClose={() => setShow2FAModal(false)} />}
    </div>
  );
}