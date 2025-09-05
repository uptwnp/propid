import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Building, Calendar, Banknote, User, FileText, Navigation, Home, Hash, Shield, CheckCircle, AlertTriangle, Building2, Ruler, CreditCard, Copy } from 'lucide-react';
import { Property, ResponseStatus } from '../types/Property';
import { responseOptions, formatPlotSize, formatCurrency } from '../utils/mapUtils';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onUpdate: (id: number, updates: { response?: string; remark?: string }) => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onClose,
  onUpdate
}) => {
  const [response, setResponse] = useState<ResponseStatus>('Not contacted');
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update form values when property changes
  useEffect(() => {
    setResponse((property.response as ResponseStatus) || 'Not contacted');
    setRemark(property.remark || '');
  }, [property.id, property.response, property.remark]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onUpdate(property.id, { response, remark });
    setIsSaving(false);
  };

  const openInMaps = () => {
    const lat = parseFloat(property.Lat);
    const lng = parseFloat(property.Long);
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const copyCoordinates = async () => {
    const lat = parseFloat(property.Lat);
    const lng = parseFloat(property.Long);
    const coordinates = `${lat},${lng}`;
    
    try {
      await navigator.clipboard.writeText(coordinates);
      // You could add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy coordinates:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Residential':
        return 'bg-blue-500 text-white';
      case 'Commercial':
        return 'bg-green-500 text-white';
      case 'Industrial':
        return 'bg-amber-500 text-white';
      case 'Vacant Plot':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-[2000] overflow-hidden border-l border-gray-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {/* Property Image */}
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              <img
                src={property.ImageViewLink}
                alt={`Property ${property.PID}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
                }}
              />
            </div>

            {/* Owner Section */}
            <div className="p-4 bg-green-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900"> {property.PropertyCategory}</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">{property.OwnerName}</p>
            </div>

            {/* Address Section */}
            <div className="p-4 bg-purple-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">{formatPlotSize(property.PlotSize, property.Unit)}</h3>
              </div>
              <p className="text-gray-900 font-medium leading-relaxed">{property.Address1}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={openInMaps}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps
                </button>
                <button
                  onClick={copyCoordinates}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy coordinates"
                >
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Phone Section */}
            {property.MobileNo && (
              <div className="p-4 bg-green-50 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                </div>
                <a
                  href={`tel:${property.MobileNo}`}
                  className="text-xl font-bold text-green-700 hover:text-green-800"
                >
                  {property.MobileNo}
                </a>
              </div>
            )}
         
            {/* Response Form Section */}
            <div className="p-4 border-b border-gray-200 bg-blue-50">              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Status
                  </label>
                  <select
                    value={response}
                    onChange={(e) => setResponse(e.target.value as ResponseStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {responseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Add any notes or remarks..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>

            {/* Property Information Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Property Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(property.PropertyCategory)}`}>
                    {property.PropertyCategory}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-bold text-lg">{formatPlotSize(property.PlotSize, property.Unit)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Colony:</span>
                  <span className="font-semibold">{property.ColonyName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Khasara No:</span>
                  <span className="font-semibold">{property.KhasaraNo}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">MC Name:</span>
                  <span className="font-semibold">{property.McName}</span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Authorised</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Verified 2023</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Property ID</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{property.PID}</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">NDC: {property.PIDNDC}</p>
              </div>
            </div>

            {/* Location Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Location</h3>
                </div>
                <button
                  onClick={copyCoordinates}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy Location
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Latitude</p>
                  <p className="font-bold">{parseFloat(property.Lat).toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Longitude</p>
                  <p className="font-bold">{parseFloat(property.Long).toFixed(6)}</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            {property.DueDetails && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Financial Details</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm">Property Tax Arrear</span>
                    </div>
                    <p className="text-blue-700 font-semibold">{formatCurrency(property.DueDetails.PtaxArrear || 0)}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm">Property Tax Demand</span>
                    </div>
                    <p className="text-blue-700 font-semibold">{formatCurrency(property.DueDetails.PtaxDemand || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Record Information */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Record Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Created</p>
                    <p className="text-gray-600 text-sm">{formatDate(property.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Last Updated</p>
                    <p className="text-gray-600 text-sm">{formatDate(property.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;