import React, { useState, useRef } from 'react';
import { useFileTransfer } from '../../hooks/useFileTransfer';
import { Upload, Download, Folder, File as FileIcon, Image, Film, Music, Archive, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileManagerProps {
  deviceId: string;
}

export function FileManager({ deviceId }: FileManagerProps) {
  const { transfers, uploadFile, downloadFile, deleteFile } = useFileTransfer(deviceId);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedFileToShare, setSelectedFileToShare] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    try {
      for (const file of selectedFiles) {
        await uploadFile(file, currentPath);
        toast.success(`${file.name} enviado com sucesso!`);
      }
      setSelectedFiles([]);
    } catch (error) {
      toast.error('Erro ao enviar arquivo(s)');
    }
  };

  const handleShare = async () => {
    if (!selectedFileToShare || !shareEmail) return;

    try {
      // Create a signed URL valid for 24 hours
      const { data, error } = await supabase.storage
        .from('file_transfers')
        .createSignedUrl(selectedFileToShare, 86400);

      if (error) throw error;

      // Here you would typically send this URL via email
      // For now, we'll just copy it to clipboard
      await navigator.clipboard.writeText(data.signedUrl);
      toast.success('Link de compartilhamento copiado!');
      
      setShowShareModal(false);
      setShareEmail('');
      setSelectedFileToShare(null);
    } catch (error) {
      toast.error('Erro ao compartilhar arquivo');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-purple-600" />;
    if (type.startsWith('video/')) return <Film className="h-5 w-5 text-red-600" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-600" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5 text-orange-600" />;
    return <FileIcon className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Transferência de Arquivos</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Enviar Arquivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </h3>
                <button
                  onClick={handleUpload}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Iniciar Upload
                </button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <span className="ml-2 text-sm text-gray-600">{file.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(transfers).map(([id, transfer]) => (
            <div key={id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {transfer.status === 'uploading' ? (
                    <Upload className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <Download className="h-5 w-5 text-green-600 mr-2" />
                  )}
                  <span className="font-medium text-gray-900">
                    {transfer.status === 'completed' ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      `${transfer.progress.toFixed(1)}%`
                    )}
                  </span>
                </div>
                {transfer.status === 'error' && (
                  <span className="text-sm text-red-600">{transfer.error}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${transfer.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Compartilhar Arquivo</h3>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Digite o e-mail"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}