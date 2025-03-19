import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { UserCircle, Upload, Camera, Key, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, signOut, enable2FA } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [isServiceProvider, setIsServiceProvider] = useState(profile?.is_service_provider || false);
  const [serviceType, setServiceType] = useState(profile?.service_type || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 5MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      await updateProfile({ profile_picture: publicUrl });
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao atualizar foto de perfil');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        company_name: companyName,
        is_service_provider: isServiceProvider,
        service_type: serviceType,
      });
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await enable2FA();
      toast.success('Autenticação de dois fatores habilitada!');
    } catch (error) {
      toast.error('Erro ao habilitar 2FA');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.full_name || ''}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <UserCircle className="w-24 h-24 text-white bg-gray-200 rounded-full border-4 border-white" />
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  profile?.full_name || 'Nome não definido'
                )}
              </h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu telefone"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.phone || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isServiceProvider}
                    onChange={(e) => setIsServiceProvider(e.target.checked)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Sou um prestador de serviços
                  </span>
                </label>
              </div>

              {isServiceProvider && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome da sua empresa"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.company_name || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Serviço
                    </label>
                    {isEditing ? (
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um tipo</option>
                        <option value="technical">Suporte Técnico</option>
                        <option value="maintenance">Manutenção</option>
                        <option value="consulting">Consultoria</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {profile?.service_type === 'technical' && 'Suporte Técnico'}
                        {profile?.service_type === 'maintenance' && 'Manutenção'}
                        {profile?.service_type === 'consulting' && 'Consultoria'}
                        {!profile?.service_type && 'Não informado'}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Segurança da Conta
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={handleEnable2FA}
                    className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Key className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        Autenticação de dois fatores
                      </span>
                    </div>
                    {profile?.two_factor_enabled ? (
                      <span className="text-sm text-green-600">Ativado</span>
                    ) : (
                      <span className="text-sm text-gray-500">Desativado</span>
                    )}
                  </button>

                  <button
                    onClick={signOut}
                    className="w-full flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}