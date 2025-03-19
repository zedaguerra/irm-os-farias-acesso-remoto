import React from 'react';
import { Star, MapPin, Phone } from 'lucide-react';
import { Profile } from '../../types/database';

interface ServiceProviderListProps {
  providers: Profile[];
  onSelect: (provider: Profile) => void;
  selectedProvider: Profile | null;
}

export function ServiceProviderList({ providers, onSelect, selectedProvider }: ServiceProviderListProps) {
  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum prestador de serviço encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
            selectedProvider?.id === provider.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSelect(provider)}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              {provider.profile_picture ? (
                <img
                  src={provider.profile_picture}
                  alt={provider.full_name || ''}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-400">
                    {(provider.full_name || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {provider.full_name}
                </h3>
                {provider.service_type && (
                  <p className="text-sm text-gray-600">
                    {provider.service_type === 'technical' && 'Suporte Técnico'}
                    {provider.service_type === 'maintenance' && 'Manutenção'}
                    {provider.service_type === 'consulting' && 'Consultoria'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= provider.rating ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {provider.rating.toFixed(1)}
                </span>
              </div>

              {provider.company_name && (
                <p className="text-sm text-gray-600">{provider.company_name}</p>
              )}

              {provider.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">{provider.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}