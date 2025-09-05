import React, { useState } from 'react';
import { Search, Filter, X, MapPin, Building, Phone, MessageSquare, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterOptions } from '../types/Property';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  properties: any[];
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  properties,
  isOpen,
  onToggle
}) => {
  const uniqueCategories = [...new Set(properties.map(p => p.PropertyCategory))];
  const uniqueColonies = [...new Set(properties.map(p => p.ColonyName))];

    const handleAddProperty = () => {
    window.open('https://prop.digiheadway.in/api/v3/props/', '_blank');
  };

  const handleExtractData = () => {
    window.open('https://prop.digiheadway.in/tool/extractor/', '_blank');
  };
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      propertyCategory: '',
      colonyName: '',
      responseStatus: '',
      hasContact: null
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== null
  ).length;

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
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Global Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                placeholder="Search by owner, address, or PID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Search across all properties globally
              </p>
            </div>

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