import React, { useState, useEffect } from 'react';
import PropertyMap from './components/PropertyMap';
import SearchFilters from './components/SearchFilters';
import PropertyDetails from './components/PropertyDetails';
import { Property, FilterOptions } from './types/Property';
import { useMapData } from './hooks/useMapData';
import { MapBounds } from './services/propertyApi';

function App() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    propertyCategory: '',
    colonyName: '',
    responseStatus: '',
    hasContact: null
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const {
    properties,
    loading,
    error,
    updatePropertyData,
    fetchDataForBounds,
    clearError,
  } = useMapData({ filters, minZoomLevel: 18 }); // Changed from 19 to 18

  const handleBoundsChange = async (bounds: MapBounds, zoom: number) => {
    await fetchDataForBounds(bounds, zoom);
  };

  const handlePropertyUpdate = async (id: number, updates: { response?: string; remark?: string }) => {
    try {
      await updatePropertyData(id, updates);
    } catch (error) {
      console.error('Failed to update property:', error);
      // You could show a toast notification here
    }
  };

  // Close filter panel on window resize for better mobile experience
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        properties={properties}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />
      
      <div className="flex-1 relative">
        <PropertyMap
          properties={properties}
          filters={filters}
          onPropertyUpdate={handlePropertyUpdate}
          onPropertySelect={setSelectedProperty}
          selectedProperty={selectedProperty}
          loading={loading}
          error={error}
          onBoundsChange={handleBoundsChange}
          onClearError={clearError}
        />
      </div>

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUpdate={handlePropertyUpdate}
        />
      )}
    </div>
  );
}

export default App;