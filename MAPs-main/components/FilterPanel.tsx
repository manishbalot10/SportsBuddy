import React, { useState, useEffect, useRef } from 'react';
import { FilterState, SportType, SkillLevel } from '../types';
import { SPORTS_CONFIG } from '../constants';
import { SlidersHorizontal, ChevronDown, ChevronUp, Users, GraduationCap } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  playerCount: number;
  isLoading: boolean;
  onExpand?: () => void;
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

// Distance presets in km (will be converted to meters for < 1km)
const DISTANCE_PRESETS = [
  { value: 0.5, label: '500 m' },
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

// Format distance for display
const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm} km`;
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, playerCount, isLoading, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userType, setUserType] = useState<'all' | 'players' | 'coaches'>(filters.userType || 'all');
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const [showCustomDistance, setShowCustomDistance] = useState(false);
  const prevCountRef = useRef(playerCount);

  // Sync userType with filters when filters change externally
  useEffect(() => {
    if (filters.userType !== undefined && filters.userType !== userType) {
      setUserType(filters.userType);
    }
  }, [filters.userType]);

  // Sport selection handler
  const handleSportChange = (sport: SportType | 'All') => {
    onFilterChange({ ...filters, sport });
  };

  // User type handler
  const handleUserTypeChange = (type: 'all' | 'players' | 'coaches') => {
    setUserType(type);
    onFilterChange({ ...filters, userType: type });
  };

  const activeFiltersCount =
    (filters.sport !== 'All' ? 1 : 0) +
    (userType !== 'all' ? 1 : 0);

  // Check if any filters are active (beyond defaults)
  // Default distance is now 5km
  const hasActiveFilters = activeFiltersCount > 0 || filters.maxDistance !== 5;

  // Check if current distance is a preset (with small tolerance for floating point)
  const isPresetDistance = DISTANCE_PRESETS.some(preset =>
    Math.abs(preset.value - filters.maxDistance) < 0.01
  );

  // Auto-expand custom slider if non-preset distance is selected
  useEffect(() => {
    if (!isPresetDistance && filters.maxDistance !== 5) {
      setShowCustomDistance(true);
    }
  }, [filters.maxDistance, isPresetDistance]);

  // Track count changes for animation
  useEffect(() => {
    if (prevCountRef.current !== playerCount && !isLoading) {
      setShouldHighlight(true);
      const timer = setTimeout(() => setShouldHighlight(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = playerCount;
  }, [playerCount, isLoading]);

  // Generate contextual message
  const getResultMessage = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (!hasActiveFilters) {
      return null; // Don't show when no filters active
    }

    if (playerCount === 0) {
      return 'No players found';
    }

    // Build filter summary
    const filterParts: string[] = [];
    if (filters.sport !== 'All') {
      filterParts.push(filters.sport);
    }
    if (userType !== 'all') {
      filterParts.push(userType === 'players' ? 'players' : 'coaches');
    }

    // Always show distance info - it's now a visual indicator
    // Note: Distance filter only works when GPS location is available
    const distanceText = `within ${formatDistance(filters.maxDistance)}`;

    // Build message: "X players within Y km" format
    if (filterParts.length > 0) {
      return `${playerCount} ${filterParts.join(' ')} ${distanceText}`;
    } else {
      return `${playerCount} player${playerCount !== 1 ? 's' : ''} ${distanceText}`;
    }
  };

  const resultMessage = getResultMessage();

  return (
    <>
      {/* Floating Filter Button - Top Left Corner */}
      <button
        onClick={() => {
          const willExpand = !isExpanded;
          setIsExpanded(willExpand);
          if (willExpand && onExpand) onExpand();
        }}
        className="absolute z-[900] w-12 h-12 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105"
        style={{ top: '37px', left: '41px' }}
        aria-label="Toggle filters"
      >
        <SlidersHorizontal className="w-5 h-5" style={{ color: '#E17827' }} />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Backdrop Overlay - Mobile Only */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[799] md:hidden transition-opacity"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Filter Panel Container - Bottom Sheet on Mobile, Top on Desktop */}
      {isExpanded && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[800] md:absolute md:top-[93px] md:left-[41px] md:right-4 md:max-w-md transition-transform duration-300 ease-out translate-y-0"
        >
          {/* Collapsible Filter Card */}
          <div className="bg-white dark:bg-zinc-900 w-full rounded-t-3xl rounded-b-none md:rounded-2xl md:w-auto max-h-[90vh] overflow-y-auto shadow-2xl md:shadow-lg dark:shadow-zinc-800/50">

            {/* Filter Content */}
            <div className="px-4 pb-4 md:pb-4 space-y-4 pt-4 max-h-[calc(90vh-80px)] overflow-y-auto overscroll-behavior-contain">

              {/* Enhanced Count Indicator - Contextual Display */}
              {resultMessage && (
                <div
                  className={`bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 transition-all duration-300 ${shouldHighlight
                      ? 'scale-105 shadow-lg ring-2 ring-orange-300 dark:ring-orange-700'
                      : ''
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          {resultMessage}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${playerCount === 0
                            ? 'bg-red-500'
                            : 'bg-green-500'
                          }`}></div>
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          {resultMessage}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Players + Coaches Toggle */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Show</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUserTypeChange('all')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${userType === 'all'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    style={userType === 'all' ? { backgroundColor: '#E17827' } : {}}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleUserTypeChange('players')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${userType === 'players'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    style={userType === 'players' ? { backgroundColor: '#E17827' } : {}}
                  >
                    <Users className="w-4 h-4" />
                    Players
                  </button>
                  <button
                    onClick={() => handleUserTypeChange('coaches')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${userType === 'coaches'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    style={userType === 'coaches' ? { backgroundColor: '#000000' } : {}}
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filters.sport === 'All'
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
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

              {/* Distance Presets */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Distance</div>
                  {!isPresetDistance && (
                    <div className="text-sm font-bold text-gray-900">{formatDistance(filters.maxDistance)}</div>
                  )}
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {DISTANCE_PRESETS.map((preset) => {
                    const isActive = filters.maxDistance === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => {
                          onFilterChange({ ...filters, maxDistance: preset.value });
                          setShowCustomDistance(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700'
                          }`}
                        style={isActive ? { backgroundColor: '#E17827' } : {}}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Distance Slider (Expandable) */}
                <div>
                  <button
                    onClick={() => setShowCustomDistance(!showCustomDistance)}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${!isPresetDistance
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <span>
                      {isPresetDistance
                        ? 'Custom distance'
                        : `Custom: ${formatDistance(filters.maxDistance)}`}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCustomDistance ? 'rotate-180' : ''}`} />
                  </button>

                  {showCustomDistance && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-gray-500">Custom range</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {formatDistance(filters.maxDistance)}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="200"
                        step="0.1"
                        value={filters.maxDistance}
                        onChange={(e) => onFilterChange({ ...filters, maxDistance: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: '#E17827' }}
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>200 m</span>
                        <span>200 km</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    onFilterChange({ sport: 'All', levels: filters.levels, maxDistance: 5, userType: 'all' });
                    setUserType('all');
                    setShowCustomDistance(false);
                  }}
                  className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
