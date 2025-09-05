import { Property, ResponseStatus } from '../types/Property';

export const getMarkerColor = (property: Property): string => {
  switch (property.PropertyCategory) {
    case 'Residential':
      return '#3B82F6'; // Blue
    case 'Commercial':
      return '#10B981'; // Green
    case 'Industrial':
      return '#F59E0B'; // Amber
    case 'Vacant Plot':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
};

export const getResponseColor = (response: ResponseStatus | null): string => {
  switch (response) {
    case 'Ready to Sell':
      return '#10B981'; // Green
    case 'Interested in Buy':
      return '#3B82F6'; // Blue
    case 'Interested in Buy and Sell':
      return '#8B5CF6'; // Purple
    case 'Not interested in Sell':
      return '#EF4444'; // Red
    case 'Unable to contact':
      return '#F59E0B'; // Amber
    case 'Another Person Phone':
      return '#F97316'; // Orange
    case 'Not contacted':
    default:
      return '#6B7280'; // Gray
  }
};

export const responseOptions: ResponseStatus[] = [
  'Not contacted',
  'Unable to contact',
  'Another Person Phone',
  'Ready to Sell',
  'Not interested in Sell',
  'Interested in Buy',
  'Interested in Buy and Sell'
];

export const formatPlotSize = (size: string, unit: string): string => {
  const numSize = parseFloat(size);
  return `${numSize.toLocaleString()} ${unit}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};