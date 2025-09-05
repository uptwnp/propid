import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Navigation, Crosshair, Map, Satellite, AlertCircle, Loader2, MapPin, Phone, Building2, Home, FileText } from 'lucide-react';
import { Property, FilterOptions, MapView } from '../types/Property';
import { getMarkerColor, getResponseColor, formatPlotSize } from '../utils/mapUtils';
import { MapBounds } from '../services/propertyApi';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  properties: Property[];
  filters: FilterOptions;
  onPropertyUpdate: (id: number, updates: { response?: string; remark?: string }) => void;
  onPropertySelect: (property: Property | null) => void;
  selectedProperty: Property | null;
  loading?: boolean;
  error?: string | null;
  onBoundsChange?: (bounds: MapBounds, zoom: number) => void;
  onClearError?: () => void;
}

const MapController: React.FC<{ view: MapView; focusLocation?: [number, number] | null }> = ({ view, focusLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    const streetLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const satelliteLayer = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    L.tileLayer(view === 'satellite' ? satelliteLayer : streetLayer, {
      attribution: view === 'satellite' 
        ? '&copy; Esri &mdash; Source: Esri, Maxar, GeoEye'
        : '&copy; OpenStreetMap contributors',
      maxZoom: 20
    }).addTo(map);
  }, [view, map]);

  // Handle location focusing
  useEffect(() => {
    if (focusLocation) {
      map.setView(focusLocation, 18, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [focusLocation, map]);
  
  return null;
};

const MapEventHandler: React.FC<{
  onBoundsChange: (bounds: MapBounds, zoom: number) => void;
}> = ({ onBoundsChange }) => {
  const map = useMapEvents({ 
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      }, zoom);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      }, zoom);
    },
  });

  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  filters, 
  onPropertyUpdate, 
  onPropertySelect,
  selectedProperty,
  loading = false,
  error = null,
  onBoundsChange,
  onClearError
}) => {
  const [mapView, setMapView] = useState<MapView>(() => {
    return (localStorage.getItem('mapView') as MapView) || 'street';
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);

  const handleMapViewChange = (view: MapView) => {
    setMapView(view);
    localStorage.setItem('mapView', view);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        setUserLocation(location);
        setFocusLocation(location);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please check your browser settings.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleBoundsChange = useCallback((bounds: MapBounds, zoom: number) => {
    setCurrentZoom(zoom);
    if (onBoundsChange) {
      onBoundsChange(bounds, zoom);
    }
  }, [onBoundsChange]);

  const handlePropertyClick = (property: Property) => {

    // If modal is already open, switch to the clicked property
    if (selectedProperty) {
      onPropertySelect(property);
    }
  };

  const getPropertyLetter = (category: string): string => {
    switch (category) {
      case 'Residential': return 'R';
      case 'Vacant Plot': return 'V';
      case 'Industrial': return 'I';
      case 'Commercial': return 'C';
      default: return 'O';
    }
  };

  const getMarkerBackgroundColor = (property: Property): string => {
    // Priority: Response status > Contact availability
    if (selectedProperty?.id === property.id) {
      return '#3B82F6'; // Blue for selected
    }
    if (property.response && property.response !== 'Not contacted') {
      return '#6B7280'; // Gray for any response status
    }
    
    if (property.MobileNo) {
      return '#10B981'; // Green if phone number exists
    }
    
    return '#EF4444'; // Red if no phone number
  };

  // Memoized icon creation function to prevent unnecessary re-renders
  const createPinIcon = useCallback((property: Property) => {
    const backgroundColor = getMarkerBackgroundColor(property);
    const letter = getPropertyLetter(property.PropertyCategory);
    const isSelected = selectedProperty?.id === property.id;
    const size = isSelected ? 36 : 28;
    
    return divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          cursor: pointer;
        ">
          <!-- Pin Shape -->
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${backgroundColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            position: absolute;
            top: 0;
            left: 0;
          "></div>
          
          <!-- Letter -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%) rotate(0deg);
            color: white;
            font-weight: bold;
            font-size: ${size > 30 ? '14px' : '12px'};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            z-index: 10;
            pointer-events: none;
          ">
            ${letter}
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  }, [selectedProperty?.id]);

  const createUserLocationIcon = () => {
    return divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #3B82F6;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Residential':
        return 'bg-blue-100 text-blue-800';
      case 'Commercial':
        return 'bg-green-100 text-green-800';
      case 'Industrial':
        return 'bg-amber-100 text-amber-800';
      case 'Vacant Plot':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    return properties.map((property) => {
      const icon = createPinIcon(property);
      
      return (
        <Marker
          key={property.id}
          position={[parseFloat(property.Lat), parseFloat(property.Long)]}
          icon={icon}
          eventHandlers={{
            click: () => handlePropertyClick(property)
          }}
        >
          <Popup className="custom-popup" closeButton={false} maxWidth={320}>
            <div className="p-0 w-60 bg-white rounded-lg overflow-hidden">
              {/* Property Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                <img
                  src={property.ImageViewLink}
                  alt={`Property ${property.PID}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
                  }}
                />
                {/* Plot Size Badge */}
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
                    {formatPlotSize(property.PlotSize, property.Unit)}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3 space-y-2">
                {/* Owner Name */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{property.OwnerName}</h3>
                </div>

                {/* Address */}
                <div className="text-gray-700">
                  <p className="text-sm leading-relaxed line-clamp-2">{property.Address1}</p>
                  <p className="text-xs text-gray-500 mt-1">Colony: {property.ColonyName}</p>
                </div>

                {/* Category and Contact */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(property.PropertyCategory)}`}>
                    {property.PropertyCategory}
                  </span>
                  
                  {property.MobileNo && (
                    <div className="flex items-center gap-1 text-green-700">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs font-medium">{property.MobileNo}</span>
                    </div>
                  )}
                </div>

                {/* Response and Remark */}
                {(property.response && property.response !== 'Not contacted') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs font-medium text-blue-900">Response: {property.response}</p>
                    {property.remark && (
                      <p className="text-xs text-blue-700 mt-1 italic line-clamp-2">"{property.remark}"</p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPropertySelect(property);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [properties, selectedProperty?.id, createPinIcon, onPropertySelect]);

  // Default center coordinates (Panipat area)
  const defaultCenter: [number, number] = [29.3810900, 76.9869630];
  const centerLat = properties.length > 0 
    ? properties.reduce((sum, p) => sum + parseFloat(p.Lat), 0) / properties.length
    : defaultCenter[0];
  const centerLng = properties.length > 0
    ? properties.reduce((sum, p) => sum + parseFloat(p.Long), 0) / properties.length
    : defaultCenter[1];

  return (
    <div className="relative h-full">
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Loading properties...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error loading properties</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Map View Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => handleMapViewChange('street')}
          className={`p-3 transition-colors ${
            mapView === 'street'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Street View"
        >
          <Map className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleMapViewChange('satellite')}
          className={`p-3 transition-colors ${
            mapView === 'satellite'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Satellite View"
        >
          <Satellite className="w-5 h-5" />
        </button>
      </div>

      {/* GPS Location Button - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-[1000]">
        <button
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="bg-white rounded-full shadow-lg p-4 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Get current location"
        >
          {isLocating ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Property Counter */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2">
        <span className="text-sm font-medium text-gray-700">
          {properties.length} Properties
          {currentZoom < 18 && (
            <span className="text-xs text-gray-500 block">
              Zoom: {currentZoom}/20
            </span>
          )}
        </span>
      </div>

      <MapContainer
        center={userLocation || [centerLat, centerLng]}
        zoom={userLocation ? 17 : 13}
        className="h-full w-full"
        zoomControl={false}
        maxZoom={20}
      >
        <MapController view={mapView} focusLocation={focusLocation} />
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="text-center">
                <Crosshair className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Optimized Property Markers */}
        {markers}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;