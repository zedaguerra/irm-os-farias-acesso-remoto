import React, { useState } from 'react';
import { useTwoFactorAuth } from '../../hooks/useTwoFactorAuth';
import { QrCode, Key, Copy, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TwoFactorAuthModalProps {
  onClose: () => void;
}

export function TwoFactorAuthModal({ onClose }: TwoFactorAuthModalProps) {
  const { loading, qrCode, backupCodes, enable2FA, verify2FACode } = useTwoFactorAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'initial' | 'verify' | 'backup'>('initial');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleEnable2FA = async () => {
    try {
      await enable2FA();
      setStep('verify');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verify2FACode(verificationCode);
      setStep('backup');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    toast.success('Códigos de backup copiados!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Autenticação de Dois Fatores
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 'initial' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
            </p>
            <button
              onClick={handleEnable2FA}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Key className="h-5 w-5 mr-2" />
                  Habilitar 2FA
                </>
              )}
            </button>
          </div>
        )}

        {step === 'verify' && qrCode && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Escaneie o QR code com seu aplicativo autenticador
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Verificação
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o código"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || !verificationCode}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Verificar
            </button>
          </div>
        )}

        {step === 'backup' && backupCodes.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Guarde estes códigos de backup em um lugar seguro. Você precisará deles caso perca acesso ao seu aplicativo autenticador.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Códigos de Backup</h3>
                <button
                  onClick={copyBackupCodes}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copiedCodes ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="font-mono text-sm bg-white p-2 rounded border border-gray-200"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}