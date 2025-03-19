import React from 'react';
import { Star, X, MapPin } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface FiltersPanelProps {
  filters: {
    serviceType: string;
    minRating: number;
    maxDistance: number;
  };
  onFilterChange: (filters: any) => void;
  onClose: () => void;
}

export function FiltersPanel({ filters, onFilterChange, onClose }: FiltersPanelProps) {
  const { location, loading: locationLoading, getLocation } = useGeolocation();
  const serviceTypes = [
    { value: '', label: 'Todos' },
    { value: 'technical', label: 'Suporte Técnico' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'consulting', label: 'Consultoria' },
  ];

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, serviceType: e.target.value });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseInt(e.target.value);
    if (distance > 0 && !location) {
      getLocation();
    }
    onFilterChange({ ...filters, maxDistance: distance });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Serviço
          </label>
          <select
            value={filters.serviceType}
            onChange={handleServiceTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação Mínima
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`p-2 rounded-lg focus:outline-none ${
                  filters.minRating >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Distância Máxima: {filters.maxDistance}km
            </label>
            {!location && filters.maxDistance > 0 && (
              <button
                onClick={getLocation}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                disabled={locationLoading}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {locationLoading ? 'Obtendo localização...' : 'Usar minha localização'}
              </button>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={filters.maxDistance}
            onChange={handleDistanceChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0km</span>
            <span>50km</span>
          </div>
        </div>
      </div>
    </div>
  );
}