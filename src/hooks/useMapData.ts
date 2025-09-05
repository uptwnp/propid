import { useState, useEffect, useCallback, useRef } from 'react';
import { Property, FilterOptions } from '../types/Property';
import { fetchPropertiesInBounds, updateProperty, searchProperties, MapBounds } from '../services/propertyApi';

// Helper function to check if a property matches size filter
const matchesSizeFilter = (property: Property, filters: FilterOptions): boolean => {
  if (!filters.sizeRange) return true;
  
  const plotSize = parseFloat(property.PlotSize);
  if (isNaN(plotSize)) return false;
  
  // Handle custom size range
  if (filters.sizeRange === 'custom') {
    const minSize = filters.minSize || 0;
    const maxSize = filters.maxSize || Infinity;
    return plotSize >= minSize && plotSize <= maxSize;
  }
  
  // Handle predefined size ranges
  switch (filters.sizeRange) {
    case 'below_80':
      return plotSize < 80;
    case '80_to_110':
      return plotSize >= 80 && plotSize <= 110;
    case '110_to_140':
      return plotSize >= 110 && plotSize <= 140;
    case '140_to_180':
      return plotSize >= 140 && plotSize <= 180;
    case '180_to_250':
      return plotSize >= 180 && plotSize <= 250;
    case '250_to_300':
      return plotSize >= 250 && plotSize <= 300;
    case '300_to_450':
      return plotSize >= 300 && plotSize <= 450;
    case '450_to_600':
      return plotSize >= 450 && plotSize <= 600;
    case '600_to_1000':
      return plotSize >= 600 && plotSize <= 1000;
    case '1000_to_1500':
      return plotSize >= 1000 && plotSize <= 1500;
    case '1500_plus':
      return plotSize >= 1500;
    default:
      return true;
  }
};

// Helper function to apply all local filters
const applyLocalFilters = (properties: Property[], filters: FilterOptions): Property[] => {
  return properties.filter(property => {
    // Size filter
    if (!matchesSizeFilter(property, filters)) return false;
    
    // Category filter
    if (filters.propertyCategory && property.PropertyCategory !== filters.propertyCategory) return false;
    
    // Colony filter
    if (filters.colonyName && property.ColonyName !== filters.colonyName) return false;
    
    // Response status filter
    if (filters.responseStatus && (property.response || 'Not contacted') !== filters.responseStatus) return false;
    
    // Contact filter
    if (filters.hasContact !== null) {
      const hasContact = !!property.MobileNo;
      if (filters.hasContact !== hasContact) return false;
    }
    
    return true;
  });
};

interface UseMapDataProps {
  filters: FilterOptions;
  minZoomLevel?: number;
  persistentResults?: Property[];
  onResultsUpdate?: (results: Property[]) => void;
  searchTriggered?: boolean;
}

interface UseMapDataReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  updatePropertyData: (id: number, updates: { response?: string; remark?: string }) => Promise<void>;
  fetchDataForBounds: (bounds: MapBounds, zoom: number) => Promise<void>;
  clearError: () => void;
  clearProperties: () => void;
}

export const useMapData = ({ 
  filters, 
  minZoomLevel = 18,
  persistentResults = [],
  onResultsUpdate,
  searchTriggered = false
}: UseMapDataProps): UseMapDataReturn => {
  const [properties, setProperties] = useState<Property[]>(persistentResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastBoundsRef = useRef<MapBounds | null>(null);
  const lastFiltersRef = useRef<FilterOptions | null>(null);

  // Check if size filter is active
  const hasSizeFilter = !!(filters.sizeRange && filters.sizeRange !== '');
  
  // Calculate effective minimum zoom level (2 levels earlier if size filter is active)
  const effectiveMinZoomLevel = hasSizeFilter ? Math.max(16, minZoomLevel - 2) : minZoomLevel;

  // Update properties when persistent results change and apply local filters
  useEffect(() => {
    if (persistentResults.length > 0) {
      const filteredResults = applyLocalFilters(persistentResults, filters);
      setProperties(filteredResults);
    }
  }, [persistentResults, filters]);

  // Handle global search when search is triggered
  useEffect(() => {
    const handleGlobalSearch = async () => {
      if (searchTriggered && filters.search && filters.search.trim().length > 0) {
        setLoading(true);
        setError(null);

        try {
          const searchResults = await searchProperties(filters.search.trim(), {
            where: filters.searchWhere || undefined,
            type: filters.propertyCategory || undefined,
            sizeRange: filters.sizeRange || undefined,
            minSize: filters.minSize || undefined,
            maxSize: filters.maxSize || undefined,
            responseStatus: filters.responseStatus || undefined,
            hasContact: filters.hasContact !== null ? filters.hasContact.toString() : undefined,
          });
          
          // Apply local filters to search results
          const filteredResults = applyLocalFilters(searchResults, filters);

          setProperties(filteredResults);
          // Update persistent results
          if (onResultsUpdate) {
            onResultsUpdate(filteredResults);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to search properties');
          console.error('Error searching properties:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    handleGlobalSearch();
  }, [searchTriggered, filters.search, filters.searchWhere, filters.propertyCategory, filters.colonyName, filters.responseStatus, filters.hasContact, filters.sizeRange, filters.minSize, filters.maxSize]);

  const fetchDataForBounds = useCallback(async (bounds: MapBounds, zoom: number) => {
    // If there's a search query and it's been triggered, don't fetch by bounds
    if (searchTriggered && filters.search && filters.search.trim().length > 0) {
      return;
    }

    // Only fetch if zoom level is sufficient (using effective minimum zoom level)
    if (zoom < effectiveMinZoomLevel) {
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
        where: filters.searchWhere || undefined,
        sizeRange: filters.sizeRange || undefined,
        minSize: filters.minSize || undefined,
        maxSize: filters.maxSize || undefined,
        responseStatus: filters.responseStatus || undefined,
        hasContact: filters.hasContact !== null ? filters.hasContact.toString() : undefined,
      };

      const data = await fetchPropertiesInBounds(bounds, apiFilters);
      
      // Apply all local filters including size filter
      const filteredData = applyLocalFilters(data, filters);

      setProperties(filteredData);
      // Update persistent results for bounds-based data
      if (onResultsUpdate) {
        onResultsUpdate(filteredData);
      }
      lastBoundsRef.current = bounds;
      lastFiltersRef.current = { ...filters };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, effectiveMinZoomLevel, properties.length, searchTriggered]);

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

  const clearProperties = useCallback(() => {
    setProperties([]);
    // Also clear persistent results
    if (onResultsUpdate) {
      onResultsUpdate([]);
    }
  }, [onResultsUpdate]);

  return {
    properties,
    loading,
    error,
    updatePropertyData,
    fetchDataForBounds,
    clearError,
    clearProperties,
  };
};