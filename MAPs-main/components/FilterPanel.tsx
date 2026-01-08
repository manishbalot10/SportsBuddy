import React, { useState } from 'react';
import { FilterState, SportType, SkillLevel } from '../types';
import { SPORTS_CONFIG } from '../constants';
import { SlidersHorizontal, ChevronDown, ChevronUp, Users, GraduationCap } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// Sport emoji mapping (for display)
const SPORT_EMOJI: Record<string, string> = {
  Cricket: '🏏',
  Badminton: '🏸',
  Football: '⚽',
  Tennis: '🎾',
  Basketball: '🏀',
  Volleyball: '🏐',
  'Table Tennis': '🏓',
  Hockey: '🏑',
  Swimming: '🏊',
  Athletics: '🏃',
};

// Top 10 sports from our database
const TOP_10_SPORTS: SportType[] = [
  'Cricket',
  'Badminton', 
  'Football',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Table Tennis',
  'Hockey',
  'Swimming',
  'Athletics'
];

// Quick filter sports (most popular)
const QUICK_FILTERS: SportType[] = ['Cricket', 'Badminton'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userType, setUserType] = useState<'all' | 'players' | 'coaches'>('all');

  // Quick filter handler - applies immediately
  const handleQuickFilter = (sport: SportType) => {
    const newSport = filters.sport === sport ? 'All' : sport;
    onFilterChange({ ...filters, sport: newSport });
  };

  // Sport selection handler
  const handleSportChange = (sport: SportType | 'All') => {
    onFilterChange({ ...filters, sport });
  };

  // User type handler
  const handleUserTypeChange = (type: 'all' | 'players' | 'coaches') => {
    setUserType(type);
    // TODO: Add userType to FilterState when backend supports it
  };

  const activeFiltersCount = 
    (filters.sport !== 'All' ? 1 : 0) + 
    (userType !== 'all' ? 1 : 0);

  return (
    <div className="absolute top-20 left-4 right-4 z-[800]">
      {/* Collapsible Filter Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md">
        
        {/* Header - Always visible */}
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Quick Filters - Always visible */}
        <div className="px-4 pb-3 flex gap-2">
          {QUICK_FILTERS.map(sport => {
            const isActive = filters.sport === sport;
            const config = SPORTS_CONFIG[sport];
            return (
              <button
                key={sport}
                onClick={() => handleQuickFilter(sport)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive ? { backgroundColor: config.colorHex } : {}}
              >
                {SPORT_EMOJI[sport]} {sport}
              </button>
            );
          })}
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            
            {/* Players + Coaches Toggle */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Show</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUserTypeChange('all')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    userType === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleUserTypeChange('players')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    userType === 'players' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Players
                </button>
                <button
                  onClick={() => handleUserTypeChange('coaches')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    userType === 'coaches' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Coaches
                </button>
              </div>
            </div>

            {/* Top 10 Sports */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Top 10 Sports
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSportChange('All')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filters.sport === 'All'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {TOP_10_SPORTS.map(sport => {
                  const isActive = filters.sport === sport;
                  const config = SPORTS_CONFIG[sport];
                  return (
                    <button
                      key={sport}
                      onClick={() => handleSportChange(sport)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={isActive ? { backgroundColor: config.colorHex } : {}}
                    >
                      {SPORT_EMOJI[sport]} {sport}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Distance</div>
                <div className="text-sm font-bold text-gray-900">{filters.maxDistance} km</div>
              </div>
              <input 
                type="range"
                min="1"
                max="100"
                value={filters.maxDistance}
                onChange={(e) => onFilterChange({...filters, maxDistance: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <button 
                onClick={() => {
                  onFilterChange({ sport: 'All', levels: filters.levels, maxDistance: 50 });
                  setUserType('all');
                }}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
