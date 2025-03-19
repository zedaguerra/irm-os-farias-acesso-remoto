import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface FileTransferProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export function useFileTransfer(deviceId: string) {
  const [transfers, setTransfers] = useState<Record<string, FileTransferProgress>>({});

  const uploadFile = async (file: File, path: string = '') => {
    const transferId = uuidv4();
    const fileName = `${transferId}-${file.name}`;
    const filePath = path ? `${deviceId}/${path}/${fileName}` : `${deviceId}/${fileName}`;

    setTransfers((prev) => ({
      ...prev,
      [transferId]: { progress: 0, status: 'pending' },
    }));

    try {
      const { error: uploadError } = await supabase.storage
        .from('file_transfers')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setTransfers((prev) => ({
              ...prev,
              [transferId]: {
                progress: percentage,
                status: 'uploading',
              },
            }));
          },
        });

      if (uploadError) throw uploadError;

      // Create file record in the database
      const { error: dbError } = await supabase.from('files').insert([
        {
          id: transferId,
          device_id: deviceId,
          name: file.name,
          path: filePath,
          size: file.size,
          type: file.type,
        },
      ]);

      if (dbError) throw dbError;

      setTransfers((prev) => ({
        ...prev,
        [transferId]: { progress: 100, status: 'completed' },
      }));

      return { transferId, filePath };
    } catch (error) {
      setTransfers((prev) => ({
        ...prev,
        [transferId]: {
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      }));
      throw error;
    }
  };

  const downloadFile = async (filePath: string) => {
    const transferId = uuidv4();

    setTransfers((prev) => ({
      ...prev,
      [transferId]: { progress: 0, status: 'pending' },
    }));

    try {
      const { data, error } = await supabase.storage
        .from('file_transfers')
        .download(filePath);

      if (error) throw error;

      setTransfers((prev) => ({
        ...prev,
        [transferId]: { progress: 100, status: 'completed' },
      }));

      return data;
    } catch (error) {
      setTransfers((prev) => ({
        ...prev,
        [transferId]: {
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Download failed',
        },
      }));
      throw error;
    }
  };

  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('file_transfers')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const deleteFile = async (filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('file_transfers')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('path', filePath);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return {
    transfers,
    uploadFile,
    downloadFile,
    getFileUrl,
    deleteFile,
  };
}