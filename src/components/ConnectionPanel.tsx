import React, { useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useConnection } from '../hooks/useConnection';

interface ConnectionPanelProps {
  deviceId: string;
  onNewConnection: () => void;
}

export function ConnectionPanel({ deviceId, onNewConnection }: ConnectionPanelProps) {
  const { connection, loading, generateQRCode } = useConnection(deviceId);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (connection?.connection_code && !connection.qr_code) {
      generateQRCode(connection.connection_code);
    }
  }, [connection?.connection_code]);

  const handleCopyCode = () => {
    if (connection?.connection_code) {
      navigator.clipboard.writeText(connection.connection_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Código de Conexão
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
            <code className="text-lg font-mono">
              {connection?.connection_code || 'Gerando...'}
            </code>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            disabled={!connection?.connection_code}
          >
            {copied ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <Copy className="h-6 w-6 text-gray-600" />
            )}
          </button>
          <button
            onClick={onNewConnection}
            className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          >
            <RefreshCw className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {connection?.connection_code && (
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            QR Code
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
            <QRCode
              value={connection.connection_code}
              size={128}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 128 128`}
            />
          </div>
        </div>
      )}
    </div>
  );
}