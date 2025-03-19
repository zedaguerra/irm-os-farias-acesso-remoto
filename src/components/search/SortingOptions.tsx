import React from 'react';
import { ArrowDownAZ, Star, MapPin } from 'lucide-react';

export type SortOption = 'distance' | 'rating' | 'name';

interface SortingOptionsProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function SortingOptions({ sortBy, onSortChange }: SortingOptionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Ordenar por:</span>
      <div className="flex bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => onSortChange('distance')}
          className={`flex items-center px-3 py-1.5 text-sm ${
            sortBy === 'distance'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Distância
        </button>
        <button
          onClick={() => onSortChange('rating')}
          className={`flex items-center px-3 py-1.5 text-sm border-l ${
            sortBy === 'rating'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star className="h-4 w-4 mr-1" />
          Avaliação
        </button>
        <button
          onClick={() => onSortChange('name')}
          className={`flex items-center px-3 py-1.5 text-sm border-l ${
            sortBy === 'name'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ArrowDownAZ className="h-4 w-4 mr-1" />
          Nome
        </button>
      </div>
    </div>
  );
}