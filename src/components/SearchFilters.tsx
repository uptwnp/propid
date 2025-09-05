import React from 'react';
import { Search, Filter, X, MapPin, Building, Phone, MessageSquare, Plus, Download } from 'lucide-react';
import { FilterOptions } from '../types/Property';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onSearchTrigger: () => void;
  onClearAll: () => void;
  properties: any[];
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearchTrigger,
  onClearAll,
  properties,
  isOpen,
  onToggle
}) => {
  const uniqueColonies = [...new Set(properties.map(p => p.ColonyName))];

    const handleAddProperty = () => {
    window.open('https://prop.digiheadway.in/api/v3/props/', '_blank');
  };

  const handleExtractData = () => {
    window.open('https://prop.digiheadway.in/tool/extractor/', '_blank');
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    // Handle different field types
    if (key === 'hasContact') {
      return value !== null;
    }
    if (key === 'minSize' || key === 'maxSize') {
      return value > 0;
    }
    if (key === 'sizeRange') {
      return value !== '';
    }
    // For all other string fields
    return value !== '';
  }).length;

  return (
    <>
      {/* Mobile Filter Toggle - Only show when sidebar is closed */}
      {!isOpen && (
        <div className="fixed top-4 left-4 z-[1100]">
          <button
            onClick={onToggle}
            className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <div className={`
        fixed  top-0 left-0 h-full w-80 bg-white shadow-xl 
        transform transition-transform duration-300 ease-in-out z-[1050]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-gray-200 overflow-y-auto
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-6">
            <div className="space-y-3">
              {/* First Line: Search Input with Search Button */}
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onSearchTrigger();
                    }
                  }}
                  placeholder="Search by property name or ID..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={onSearchTrigger}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Second Line: Field Selection Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Search in:</span>
                <select
                  value={filters.searchWhere}
                  onChange={(e) => onFiltersChange({ ...filters, searchWhere: e.target.value })}
                  className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                >
                  <option value="">Global</option>
                  <option value="Address1">Address</option>
                  <option value="ColonyName">Colony</option>
                  <option value="MobileNo">Mobile</option>
                  <option value="OwnerName">Owner</option>
                  <option value="id">ID</option>
                  <option value="remark">Remark</option>
                  <option value="response">Response</option>
                </select>
              </div>
            </div>

            {/* Size Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Plot Size Range
              </label>
              <select
                value={filters.sizeRange}
                onChange={(e) => onFiltersChange({ ...filters, sizeRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sizes</option>
                <option value="below_80">Below 80 sq yard</option>
                <option value="80_to_110">80 - 110 sq yard</option>
                <option value="110_to_140">110 - 140 sq yard</option>
                <option value="140_to_180">140 - 180 sq yard</option>
                <option value="180_to_250">180 - 250 sq yard</option>
                <option value="250_to_300">250 - 300 sq yard</option>
                <option value="300_to_450">300 - 450 sq yard</option>
                <option value="450_to_600">450 - 600 sq yard</option>
                <option value="600_to_1000">600 - 1000 sq yard</option>
                <option value="1000_to_1500">1000 - 1500 sq yard</option>
                <option value="1500_plus">1500+ sq yard</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Size Range - Only show when Custom Range is selected */}
            {filters.sizeRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Size Range (sq yard)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minSize || ''}
                    onChange={(e) => onFiltersChange({ ...filters, minSize: parseFloat(e.target.value) || 0 })}
                    placeholder="Min size"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxSize || ''}
                    onChange={(e) => onFiltersChange({ ...filters, maxSize: parseFloat(e.target.value) || 0 })}
                    placeholder="Max size"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set custom size range in square feet
                </p>
              </div>
            )}

            {/* Property Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Property Category
              </label>
              <select
                value={filters.propertyCategory}
                onChange={(e) => onFiltersChange({ ...filters, propertyCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Vacant Plot">Vacant Plot</option>
              </select>
            </div>

            {/* Response Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Response Status
              </label>
              <select
                value={filters.responseStatus}
                onChange={(e) => onFiltersChange({ ...filters, responseStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Responses</option>
                <option value="Not contacted">Not contacted</option>
                <option value="Unable to contact">Unable to contact</option>
                <option value="Another Person Phone">Another Person Phone</option>
                <option value="Ready to Sell">Ready to Sell</option>
                <option value="Not interested in Sell">Not interested in Sell</option>
                <option value="Interested in Buy">Interested in Buy</option>
                <option value="Interested in Buy and Sell">Interested in Buy and Sell</option>
              </select>
            </div>

            {/* Contact Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Availability
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasContact"
                    checked={filters.hasContact === null}
                    onChange={() => onFiltersChange({ ...filters, hasContact: null })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">All Properties</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasContact"
                    checked={filters.hasContact === true}
                    onChange={() => onFiltersChange({ ...filters, hasContact: true })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">With Contact Number</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasContact"
                    checked={filters.hasContact === false}
                    onChange={() => onFiltersChange({ ...filters, hasContact: false })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">No Contact Number</span>
                </label>
              </div>
            </div>

            {/* Colony Filter - Only show if we have properties loaded */}
            {uniqueColonies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Colony/Sector
                </label>
                <select
                  value={filters.colonyName}
                  onChange={(e) => onFiltersChange({ ...filters, colonyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Areas</option>
                  {uniqueColonies.map(colony => (
                    <option key={colony} value={colony}>{colony}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
  {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAddProperty}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Property
              </button>
              
              <button
                onClick={handleExtractData}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-5 h-5" />
                Extract Data
              </button>
            </div>
          {/* Stats */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Stats</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Total Properties: {properties.length}</p>
              <p>With Contact: {properties.filter(p => p.MobileNo).length}</p>
              <p>Contacted: {properties.filter(p => p.response && p.response !== 'Not contacted').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1040]"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default SearchFilters;