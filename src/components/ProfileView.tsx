import React from 'react';
import { Profile } from '../types/database';
import { UserCircle, Star, MapPin, Phone, Building2, Tag } from 'lucide-react';

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.full_name || ''}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-32 h-32 text-gray-300" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.full_name}
            </h2>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Editar Perfil
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {profile.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.is_service_provider && (
              <>
                {profile.company_name && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span>{profile.company_name}</span>
                  </div>
                )}

                {profile.service_type && (
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-5 w-5 mr-2" />
                    <span>
                      {profile.service_type === 'technical' && 'Suporte Técnico'}
                      {profile.service_type === 'maintenance' && 'Manutenção'}
                      {profile.service_type === 'consulting' && 'Consultoria'}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 mr-2 text-yellow-400" />
                  <span>{profile.rating.toFixed(1)} / 5.0</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}