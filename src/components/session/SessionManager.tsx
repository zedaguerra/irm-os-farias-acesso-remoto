import React, { useState } from 'react';
import { useSessionManagement } from '../../hooks/useSessionManagement';
import { Monitor, Power, QrCode, Copy, Check, Clock } from 'lucide-react';
import QRCodeComponent from 'react-qr-code';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SessionManagerProps {
  machineId: string;
}

export function SessionManager({ machineId }: SessionManagerProps) {
  const { activeSession, loading, startSession, endSession } = useSessionManagement(machineId);
  const [copied, setCopied] = useState(false);

  const handleStartSession = async () => {
    try {
      await startSession('remote');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const copyToken = () => {
    if (!activeSession?.connection_tokens?.[0]?.token) return;
    
    navigator.clipboard.writeText(activeSession.connection_tokens[0].token);
    setCopied(true);
    toast.success('Connection token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpirationTime = () => {
    const token = activeSession?.connection_tokens?.[0];
    if (!token?.expires_at) return null;
    
    return format(new Date(token.expires_at), 'HH:mm:ss');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Monitor className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Remote Connection</h2>
        </div>
        {activeSession && (
          <button
            onClick={endSession}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={loading}
          >
            <Power className="h-4 w-4 mr-2" />
            End Session
          </button>
        )}
      </div>

      {!activeSession && (
        <button
          onClick={handleStartSession}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Monitor className="h-5 w-5 mr-2" />
              Start Remote Session
            </>
          )}
        </button>
      )}

      {activeSession && activeSession.connection_tokens?.[0] && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col items-center">
            <QRCodeComponent
              value={activeSession.connection_tokens[0].token}
              size={200}
              level="H"
            />
            <p className="mt-4 text-sm text-gray-600">
              Scan this QR code with the Irmãos Farias app
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Connection Token</p>
              <p className="text-lg font-mono">{activeSession.connection_tokens[0].token}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Expires at {getExpirationTime()}</span>
              </div>
            </div>
            <button
              onClick={copyToken}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Share this token with the person you want to grant access to your machine.
              The token will expire in 30 minutes if not used.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}