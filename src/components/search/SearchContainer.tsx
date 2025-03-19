import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchBar } from './SearchBar';
import { FiltersPanel } from './FiltersPanel';
import { ServiceProviderList } from './ServiceProviderList';
import { MapView } from './MapView';
import { SortingOptions, type SortOption } from './SortingOptions';
import { Profile } from '../../types/database';
import { useGeolocation } from '../../hooks/useGeolocation';
import { calculateDistance } from '../../utils/distance';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const RESULTS_PER_PAGE = 12;

export function SearchContainer() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Profile | null>(null);
  const [filters, setFilters] = useState({
    serviceType: '',
    minRating: 0,
    maxDistance: 25,
  });
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { location, getLocation } = useGeolocation();
  const observerTarget = useRef<HTMLDivElement>(null);

  const sortResults = (results: Profile[]) => {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!location || !a.latitude || !a.longitude || !b.latitude || !b.longitude) {
            return 0;
          }
          const distanceA = calculateDistance(
            location.latitude,
            location.longitude,
            a.latitude,
            a.longitude
          );
          const distanceB = calculateDistance(
            location.latitude,
            location.longitude,
            b.latitude,
            b.longitude
          );
          return distanceA - distanceB;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        default:
          return 0;
      }
    });
  };

  const loadResults = async (searchQuery: string, isNewSearch: boolean = false) => {
    if (loading || (!hasMore && !isNewSearch)) return;

    setLoading(true);
    try {
      const from = isNewSearch ? 0 : page * RESULTS_PER_PAGE;
      const to = from + RESULTS_PER_PAGE - 1;

      const query = supabase
        .from('profiles')
        .select('*')
        .eq('is_service_provider', true)
        .order('rating', { ascending: false });

      if (searchQuery) {
        query.ilike('full_name', `%${searchQuery}%`);
      }

      if (filters.serviceType) {
        query.eq('service_type', filters.serviceType);
      }

      if (filters.minRating > 0) {
        query.gte('rating', filters.minRating);
      }

      query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply distance filtering if location is available
      if (location && filters.maxDistance > 0) {
        filteredData = filteredData.filter((provider) => {
          if (!provider.latitude || !provider.longitude) return false;
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            provider.latitude,
            provider.longitude
          );
          return distance <= filters.maxDistance;
        });
      }

      // Sort results
      const sortedData = sortResults(filteredData);

      if (isNewSearch) {
        setSearchResults(sortedData);
        setPage(1);
      } else {
        setSearchResults((prev) => sortResults([...prev, ...sortedData]));
        setPage((prev) => prev + 1);
      }

      setHasMore(filteredData.length === RESULTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  const debouncedLoadResults = useCallback(
    debounce((query: string) => loadResults(query, true), 300),
    [filters, location, sortBy]
  );

  const handleSearch = (results: Profile[]) => {
    debouncedLoadResults('');
  };

  const handleProviderSelect = (provider: Profile) => {
    setSelectedProvider(provider);
  };

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadResults('');
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  // Request location when maxDistance filter changes
  useEffect(() => {
    if (filters.maxDistance > 0 && !location) {
      getLocation();
    }
  }, [filters.maxDistance]);

  // Reload results when sort option changes
  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchResults(sortResults(searchResults));
    }
  }, [sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>
          {showFilters && (
            <div className="w-80">
              <FiltersPanel
                filters={filters}
                onFilterChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {searchResults.length} prestadores encontrados
          </h2>
          <SortingOptions sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ServiceProviderList
              providers={searchResults}
              onSelect={handleProviderSelect}
              selectedProvider={selectedProvider}
            />

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="w-full h-20 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                )}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            <MapView
              providers={searchResults}
              userLocation={location}
              selectedProvider={selectedProvider}
              onProviderSelect={handleProviderSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}