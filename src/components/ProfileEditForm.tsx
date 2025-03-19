import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { UserCircle, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProfile } from '../hooks/useProfile';

interface ProfileEditFormProps {
  profile: Profile;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileEditForm({ profile, onCancel, onSave }: ProfileEditFormProps) {
  const { updateProfile } = useProfile(profile.id);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [companyName, setCompanyName] = useState(profile.company_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [isServiceProvider, setIsServiceProvider] = useState(profile.is_service_provider);
  const [serviceType, setServiceType] = useState(profile.service_type || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profile_picture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Apenas imagens JPEG e PNG são permitidas');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return profile.profile_picture;
    
    const fileExt = profileImage.name.split('.').pop();
    const fileName = `${profile.id}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, profileImage, {
        upsert: true,
      });

    if (error) {
      toast.error('Erro ao fazer upload da imagem');
      return profile.profile_picture;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const imageUrl = await handleImageUpload();
      
      const updates: Partial<Profile> = {
        full_name: fullName,
        company_name: companyName || null,
        phone: phone || null,
        is_service_provider: isServiceProvider,
        service_type: serviceType || null,
        profile_picture: imageUrl,
      };

      await updateProfile(updates);
      toast.success('Perfil atualizado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-32 h-32 text-gray-300" />
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="mt-2 text-sm text-gray-500">
              Clique para alterar a foto de perfil
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isServiceProvider}
                onChange={(e) => setIsServiceProvider(e.target.checked)}
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
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Serviço
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isServiceProvider}
                >
                  <option value="">Selecione um tipo</option>
                  <option value="technical">Suporte Técnico</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="consulting">Consultoria</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}