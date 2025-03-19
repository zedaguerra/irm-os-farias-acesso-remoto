import React, { useState, useCallback, useRef } from 'react';
import { Search, Sliders } from 'lucide-react';
import { debounce } from 'lodash';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SearchBarProps {
  onSearch: (results: any[]) => void;
  onToggleFilters: () => void;
}

export function SearchBar({ onSearch, onToggleFilters }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchProviders = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearch([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_service_provider', true)
        .ilike('full_name', `%${searchQuery}%`)
        .order('rating', { ascending: false });

      if (error) throw error;
      onSearch(data || []);
    } catch (error) {
      console.error('Error searching providers:', error);
      toast.error('Erro ao buscar prestadores de serviços');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((q: string) => searchProviders(q), 300),
    []
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Buscar prestadores de serviços..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <button
          onClick={onToggleFilters}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Sliders className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}