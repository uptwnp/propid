import React, { useEffect, useState } from 'react';
import PropertyMap from './components/PropertyMap';
import SearchFilters from './components/SearchFilters';
import PropertyDetails from './components/PropertyDetails';
import StateIndicator from './components/StateIndicator';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Property } from './types/Property';
import { useMapData } from './hooks/useMapData';
import { MapBounds } from './services/propertyApi';
import { useAppState } from './hooks/usePersistentState';

function App() {
  const {
    filters,
    setFilters,
    isFilterOpen,
    setIsFilterOpen,
    selectedProperty,
    setSelectedProperty,
    mapView,
    setMapView,
    currentZoom,
    setCurrentZoom,
    mapCenter,
    setMapCenter,
    userLocation,
    setUserLocation,
    mapBounds,
    setMapBounds,
    searchResults,
    setSearchResults,
    clearAllState
  } = useAppState();

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const {
    properties,
    loading,
    error,
    updatePropertyData,
    fetchDataForBounds,
    clearError,
    clearProperties,
  } = useMapData({ 
    filters, 
    minZoomLevel: 18,
    persistentResults: searchResults,
    onResultsUpdate: setSearchResults,
    searchTriggered
  });

  const handleBoundsChange = async (bounds: MapBounds, zoom: number) => {
    setIsSaving(true);
    setCurrentZoom(zoom);
    setMapBounds(bounds);
    setLastSaved(new Date());
    setIsSaving(false);
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

  const handleSearchTrigger = () => {
    setSearchTriggered(true);
    // Reset the trigger after a short delay to allow for re-triggering
    setTimeout(() => setSearchTriggered(false), 100);
  };

  const handleClearAll = () => {
    // Clear all persistent state
    clearAllState();
    // Clear fetched properties
    clearProperties();
    // Reset local state
    setLastSaved(null);
    setIsSaving(false);
    setSearchTriggered(false);
  };

  const handlePWAUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  const handlePWADismiss = () => {
    // Dismiss the update prompt
    console.log('PWA update dismissed');
  };

  const handlePWAInstall = () => {
    console.log('PWA install initiated');
  };

  const handlePWAInstallDismiss = () => {
    console.log('PWA install dismissed');
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
        onSearchTrigger={handleSearchTrigger}
        onClearAll={handleClearAll}
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
          mapView={mapView}
          onMapViewChange={setMapView}
          currentZoom={currentZoom}
          mapCenter={mapCenter}
          onMapCenterChange={setMapCenter}
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
        />
      </div>

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUpdate={handlePropertyUpdate}
        />
      )}

      {/* State persistence indicator - only shows errors */}
      <StateIndicator 
        error={error}
      />

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt
        onUpdate={handlePWAUpdate}
        onDismiss={handlePWADismiss}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        onInstall={handlePWAInstall}
        onDismiss={handlePWAInstallDismiss}
      />
    </div>
  );
}

export default App;