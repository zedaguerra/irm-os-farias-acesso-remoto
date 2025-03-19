import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useTwoFactorAuth() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const enable2FA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      setQrCode(data.qr_code);
      setBackupCodes(data.backup_codes || []);
      toast.success('2FA habilitado com sucesso!');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Erro ao habilitar 2FA');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verify2FACode = async (code: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        code
      });

      if (error) throw error;
      toast.success('Código verificado com sucesso!');
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast.error('Código inválido');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'totp'
      });

      if (error) throw error;
      setQrCode(null);
      setBackupCodes([]);
      toast.success('2FA desabilitado com sucesso!');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Erro ao desabilitar 2FA');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    qrCode,
    backupCodes,
    enable2FA,
    verify2FACode,
    disable2FA
  };
}