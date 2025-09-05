import { useState, useEffect, useCallback, useRef } from 'react';
import { Property, FilterOptions } from '../types/Property';
import { fetchPropertiesInBounds, updateProperty, searchProperties, MapBounds } from '../services/propertyApi';

interface UseMapDataProps {
  filters: FilterOptions;
  minZoomLevel?: number;
}

interface UseMapDataReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  updatePropertyData: (id: number, updates: { response?: string; remark?: string }) => Promise<void>;
  fetchDataForBounds: (bounds: MapBounds, zoom: number) => Promise<void>;
  clearError: () => void;
}

export const useMapData = ({ 
  filters, 
  minZoomLevel = 18
}: UseMapDataProps): UseMapDataReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastBoundsRef = useRef<MapBounds | null>(null);
  const lastFiltersRef = useRef<FilterOptions | null>(null);

  // Handle global search when search term is provided
  useEffect(() => {
    const handleGlobalSearch = async () => {
      if (filters.search && filters.search.trim().length > 2) {
        setLoading(true);
        setError(null);

        try {
          const searchResults = await searchProperties(filters.search.trim());
          
          // Apply local filters to search results
          const filteredResults = searchResults.filter(property => {
            const matchesCategory = !filters.propertyCategory || 
              property.PropertyCategory === filters.propertyCategory;
            
            const matchesColony = !filters.colonyName || 
              property.ColonyName === filters.colonyName;
            
            const matchesResponse = !filters.responseStatus || 
              (property.response || 'Not contacted') === filters.responseStatus;
            
            const matchesContact = filters.hasContact === null || 
              (filters.hasContact ? !!property.MobileNo : !property.MobileNo);
            
            return matchesCategory && matchesColony && matchesResponse && matchesContact;
          });

          setProperties(filteredResults);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to search properties');
          console.error('Error searching properties:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(handleGlobalSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.propertyCategory, filters.colonyName, filters.responseStatus, filters.hasContact]);

  const fetchDataForBounds = useCallback(async (bounds: MapBounds, zoom: number) => {
    // If there's a search query, don't fetch by bounds
    if (filters.search && filters.search.trim().length > 2) {
      return;
    }

    // Only fetch if zoom level is sufficient
    if (zoom < minZoomLevel) {
      // Don't clear properties if we have less than 1000 results
      if (properties.length >= 1000) {
        setProperties([]);
      }
      return;
    }

    // Check if bounds or filters have changed significantly
    const boundsChanged = !lastBoundsRef.current || 
      Math.abs(lastBoundsRef.current.minLat - bounds.minLat) > 0.001 ||
      Math.abs(lastBoundsRef.current.maxLat - bounds.maxLat) > 0.001 ||
      Math.abs(lastBoundsRef.current.minLng - bounds.minLng) > 0.001 ||
      Math.abs(lastBoundsRef.current.maxLng - bounds.maxLng) > 0.001;

    const filtersChanged = !lastFiltersRef.current ||
      JSON.stringify(lastFiltersRef.current) !== JSON.stringify(filters);

    if (!boundsChanged && !filtersChanged) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiFilters = {
        type: filters.propertyCategory || undefined,
      };

      const data = await fetchPropertiesInBounds(bounds, apiFilters);
      
      // Apply client-side filters that aren't handled by the API
      const filteredData = data.filter(property => {
        const matchesColony = !filters.colonyName || 
          property.ColonyName === filters.colonyName;
        
        const matchesResponse = !filters.responseStatus || 
          (property.response || 'Not contacted') === filters.responseStatus;
        
        const matchesContact = filters.hasContact === null || 
          (filters.hasContact ? !!property.MobileNo : !property.MobileNo);
        
        return matchesColony && matchesResponse && matchesContact;
      });

      setProperties(filteredData);
      lastBoundsRef.current = bounds;
      lastFiltersRef.current = { ...filters };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, minZoomLevel, properties.length]);

  const updatePropertyData = useCallback(async (
    id: number, 
    updates: { response?: string; remark?: string }
  ) => {
    try {
      const success = await updateProperty(id, updates);
      
      if (success) {
        setProperties(prev => 
          prev.map(property => 
            property.id === id 
              ? { ...property, ...updates, updated_at: new Date().toISOString() }
              : property
          )
        );
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    updatePropertyData,
    fetchDataForBounds,
    clearError,
  };
};