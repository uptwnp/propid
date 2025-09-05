import { Property } from '../types/Property';

const API_BASE_URL = 'https://prop.digiheadway.in/api/v3/props/get_api.php';

// Helper function to convert size range to min/max values
const getSizeRangeValues = (sizeRange: string): { minSize: number | null; maxSize: number | null } => {
  switch (sizeRange) {
    case 'below_80':
      return { minSize: null, maxSize: 80 };
    case '80_to_110':
      return { minSize: 80, maxSize: 110 };
    case '110_to_140':
      return { minSize: 110, maxSize: 140 };
    case '140_to_180':
      return { minSize: 140, maxSize: 180 };
    case '180_to_250':
      return { minSize: 180, maxSize: 250 };
    case '250_to_300':
      return { minSize: 250, maxSize: 300 };
    case '300_to_450':
      return { minSize: 300, maxSize: 450 };
    case '450_to_600':
      return { minSize: 450, maxSize: 600 };
    case '600_to_1000':
      return { minSize: 600, maxSize: 1000 };
    case '1000_to_1500':
      return { minSize: 1000, maxSize: 1500 };
    case '1500_plus':
      return { minSize: 1500, maxSize: null };
    default:
      return { minSize: null, maxSize: null };
  }
};

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface PropertyFilters {
  search?: string;
  type?: string;
  where?: string;
  sizeRange?: string;
  minSize?: number;
  maxSize?: number;
  responseStatus?: string;
  hasContact?: string;
}

// Global search function - searches without bounds
export const searchProperties = async (
  searchQuery: string,
  filters: PropertyFilters = {}
): Promise<Property[]> => {
  try {
    const params = new URLSearchParams({
      search: searchQuery,
    });

    // Add additional filters
    if (filters.where) {
      params.append('where', filters.where);
    }
    if (filters.type) {
      params.append('type', filters.type);
    }
    // Convert size range to min/max values
    if (filters.sizeRange && filters.sizeRange !== 'custom') {
      const { minSize, maxSize } = getSizeRangeValues(filters.sizeRange);
      if (minSize !== null) {
        params.append('min_size', minSize.toString());
      }
      if (maxSize !== null) {
        params.append('max_size', maxSize.toString());
      }
    }
    
    // Custom size range (when sizeRange is 'custom')
    if (filters.sizeRange === 'custom') {
      if (filters.minSize && filters.minSize > 0) {
        params.append('min_size', filters.minSize.toString());
      }
      if (filters.maxSize && filters.maxSize > 0) {
        params.append('max_size', filters.maxSize.toString());
      }
    }
    if (filters.responseStatus) {
      params.append('response_status', filters.responseStatus);
    }
    if (filters.hasContact) {
      params.append('has_contact', filters.hasContact);
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API data to match our Property interface
    return data.map((item: any) => ({
      ...item,
      id: item.id || item.pkPropertyId,
      DueDetails: item.DueDetails || { pkDueId: 0, PtaxArrear: 0, PtaxDemand: 0, TotalDue: 0 },
      LocationsDataJson: item.LocationsDataJson || null,
    }));
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const fetchPropertiesInBounds = async (
  bounds: MapBounds,
  filters: PropertyFilters = {}
): Promise<Property[]> => {
  try {
    const params = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      maxLat: bounds.maxLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLng: bounds.maxLng.toString(),
    });

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.where) {
      params.append('where', filters.where);
    }

    if (filters.type) {
      params.append('type', filters.type);
    }

    // Convert size range to min/max values
    if (filters.sizeRange && filters.sizeRange !== 'custom') {
      const { minSize, maxSize } = getSizeRangeValues(filters.sizeRange);
      if (minSize !== null) {
        params.append('min_size', minSize.toString());
      }
      if (maxSize !== null) {
        params.append('max_size', maxSize.toString());
      }
    }
    
    // Custom size range (when sizeRange is 'custom')
    if (filters.sizeRange === 'custom') {
      if (filters.minSize && filters.minSize > 0) {
        params.append('min_size', filters.minSize.toString());
      }
      if (filters.maxSize && filters.maxSize > 0) {
        params.append('max_size', filters.maxSize.toString());
      }
    }

    if (filters.responseStatus) {
      params.append('response_status', filters.responseStatus);
    }

    if (filters.hasContact) {
      params.append('has_contact', filters.hasContact);
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API data to match our Property interface
    return data.map((item: any) => ({
      ...item,
      id: item.id || item.pkPropertyId,
      DueDetails: item.DueDetails || { pkDueId: 0, PtaxArrear: 0, PtaxDemand: 0, TotalDue: 0 },
      LocationsDataJson: item.LocationsDataJson || null,
    }));
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const updateProperty = async (
  id: number,
  updates: { response?: string; remark?: string }
): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};