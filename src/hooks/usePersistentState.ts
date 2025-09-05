import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persistent state management using localStorage
 * Provides automatic saving and loading of state with optional validation
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: {
    validate?: (value: any) => boolean;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    validate = () => true,
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  // Initialize state with value from localStorage or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = deserialize(stored);
        if (validate(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`Failed to load state for key "${key}":`, error);
    }
    return defaultValue;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Failed to save state for key "${key}":`, error);
    }
  }, [key, state, serialize]);

  // Update state function
  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      return newValue;
    });
  }, []);

  // Clear state function
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Failed to clear state for key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [state, setPersistentState, clearState];
}

/**
 * Hook for managing application-wide persistent state
 * Centralizes all state persistence logic
 */
export function useAppState() {
  // Filter state
  const [filters, setFilters, clearFilters] = usePersistentState(
    'propid-filters',
    {
      search: '',
      propertyCategory: '',
      colonyName: '',
      responseStatus: '',
      hasContact: null,
      searchWhere: '',
      sizeRange: '',
      minSize: 0,
      maxSize: 0
    },
    {
      validate: (value) => 
        value && 
        typeof value === 'object' &&
        typeof value.search === 'string' &&
        typeof value.propertyCategory === 'string' &&
        typeof value.colonyName === 'string' &&
        typeof value.responseStatus === 'string' &&
        (value.hasContact === null || typeof value.hasContact === 'boolean') &&
        typeof value.searchWhere === 'string' &&
        typeof value.sizeRange === 'string' &&
        typeof value.minSize === 'number' &&
        typeof value.maxSize === 'number'
    }
  );

  // UI state
  const [isFilterOpen, setIsFilterOpen, clearFilterOpen] = usePersistentState(
    'propid-filter-open',
    false,
    { validate: (value) => typeof value === 'boolean' }
  );

  // Selected property state
  const [selectedProperty, setSelectedProperty, clearSelectedProperty] = usePersistentState(
    'propid-selected-property',
    null,
    {
      validate: (value) => value === null || (value && typeof value === 'object' && typeof value.id === 'number')
    }
  );

  // Map state
  const [mapView, setMapView, clearMapView] = usePersistentState(
    'propid-map-view',
    'street' as 'street' | 'satellite',
    {
      validate: (value) => value === 'street' || value === 'satellite'
    }
  );

  const [currentZoom, setCurrentZoom, clearZoom] = usePersistentState(
    'propid-current-zoom',
    13,
    {
      validate: (value) => typeof value === 'number' && value >= 1 && value <= 20
    }
  );

  const [mapCenter, setMapCenter, clearMapCenter] = usePersistentState(
    'propid-map-center',
    [29.3810900, 76.9869630] as [number, number],
    {
      validate: (value) => 
        Array.isArray(value) && 
        value.length === 2 && 
        typeof value[0] === 'number' && 
        typeof value[1] === 'number' &&
        value[0] >= -90 && value[0] <= 90 &&
        value[1] >= -180 && value[1] <= 180
    }
  );

  const [userLocation, setUserLocation, clearUserLocation] = usePersistentState(
    'propid-user-location',
    null as [number, number] | null,
    {
      validate: (value) => 
        value === null || 
        (Array.isArray(value) && 
         value.length === 2 && 
         typeof value[0] === 'number' && 
         typeof value[1] === 'number' &&
         value[0] >= -90 && value[0] <= 90 &&
         value[1] >= -180 && value[1] <= 180)
    }
  );

  const [mapBounds, setMapBounds, clearMapBounds] = usePersistentState(
    'propid-map-bounds',
    null as {
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
    } | null,
    {
      validate: (value) => 
        value === null || 
        (value && 
         typeof value === 'object' &&
         typeof value.minLat === 'number' &&
         typeof value.maxLat === 'number' &&
         typeof value.minLng === 'number' &&
         typeof value.maxLng === 'number')
    }
  );

  // Search results persistence
  const [searchResults, setSearchResults, clearSearchResults] = usePersistentState(
    'propid-search-results',
    [] as any[],
    {
      validate: (value) => Array.isArray(value)
    }
  );

  // Clear all state function
  const clearAllState = useCallback(() => {
    clearFilters();
    clearFilterOpen();
    clearSelectedProperty();
    clearMapView();
    clearZoom();
    clearMapCenter();
    clearUserLocation();
    clearMapBounds();
    clearSearchResults();
  }, [
    clearFilters,
    clearFilterOpen,
    clearSelectedProperty,
    clearMapView,
    clearZoom,
    clearMapCenter,
    clearUserLocation,
    clearMapBounds,
    clearSearchResults
  ]);

  return {
    // Filter state
    filters,
    setFilters,
    clearFilters,
    
    // UI state
    isFilterOpen,
    setIsFilterOpen,
    clearFilterOpen,
    
    // Property state
    selectedProperty,
    setSelectedProperty,
    clearSelectedProperty,
    
    // Map state
    mapView,
    setMapView,
    clearMapView,
    currentZoom,
    setCurrentZoom,
    clearZoom,
    mapCenter,
    setMapCenter,
    clearMapCenter,
    userLocation,
    setUserLocation,
    clearUserLocation,
    mapBounds,
    setMapBounds,
    clearMapBounds,
    
    // Search results state
    searchResults,
    setSearchResults,
    clearSearchResults,
    
    // Utility functions
    clearAllState
  };
}
