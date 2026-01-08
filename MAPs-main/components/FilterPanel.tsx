import React, { useState } from 'react';
import { FilterState, SportType, SkillLevel } from '../types';
import { SPORTS_CONFIG } from '../constants';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const LEVEL_CONFIG: Record<SkillLevel, { color: string; accent: string }> = {
  Beginner: { color: '#22c55e', accent: '#dcfce7' },
  Intermediate: { color: '#3b82f6', accent: '#dbeafe' },
  Advanced: { color: '#a855f7', accent: '#f3e8ff' },
  Professional: { color: '#f97316', accent: '#ffedd5' },
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleLevel = (level: SkillLevel) => {
    setLocalFilters(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: !prev.levels[level]
      }
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const resetFilters: FilterState = {
      sport: 'All',
      levels: {
        Beginner: true,
        Intermediate: true,
        Advanced: true,
        Professional: true
      },
      maxDistance: 50
    };
    setLocalFilters(resetFilters);
  };

  const activeFiltersCount = 
    (localFilters.sport !== 'All' ? 1 : 0) + 
    Object.values(localFilters.levels).filter(v => !v).length +
    (localFilters.maxDistance !== 50 ? 1 : 0);

  return (
    <>
      {/* Trigger Button - Minimalist */}
      <div className="absolute top-24 right-4 z-[800]">
        <button 
          onClick={() => setIsOpen(true)}
          className="relative h-11 px-4 bg-white rounded-xl shadow-lg flex items-center gap-2 hover:shadow-xl transition-all text-gray-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </div>
          )}
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Minimalist Panel - Left accent bar design */}
          <div className="relative bg-white w-full max-w-[400px] sm:rounded-[20px] rounded-t-[20px] overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500" />
            
            {/* Header */}
            <div className="pl-6 pr-5 pt-5 pb-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Filters</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="pl-6 pr-5 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Sport */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sport</div>
                <div className="relative">
                  <select 
                    value={localFilters.sport}
                    onChange={(e) => setLocalFilters({...localFilters, sport: e.target.value as SportType | 'All'})}
                    className="w-full bg-gray-50 px-4 py-3 rounded-xl appearance-none font-medium text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:bg-gray-100"
                  >
                    <option value="All">All Sports</option>
                    {Object.keys(SPORTS_CONFIG).map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Skill Level - Vertical list with accent colors */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Skill Level</div>
                <div className="space-y-2">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Professional'] as SkillLevel[]).map((level) => {
                    const isSelected = localFilters.levels[level];
                    const config = LEVEL_CONFIG[level];
                    return (
                      <button
                        key={level}
                        onClick={() => toggleLevel(level)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isSelected ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                        }`}
                        style={{
                          borderLeft: isSelected ? `3px solid ${config.color}` : '3px solid transparent',
                        }}
                      >
                        {/* Custom checkbox */}
                        <div 
                          className="w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0"
                          style={{ 
                            backgroundColor: isSelected ? config.color : '#e5e7eb',
                          }}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                          {level}
                        </span>
                        {/* Color indicator dot */}
                        <div 
                          className="ml-auto w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Distance */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Distance</div>
                  <div className="text-sm font-bold text-gray-900">{localFilters.maxDistance} km</div>
                </div>
                <div className="relative h-10 flex items-center">
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    value={localFilters.maxDistance}
                    onChange={(e) => setLocalFilters({...localFilters, maxDistance: parseInt(e.target.value)})}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Track */}
                  <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
                  <div 
                    className="absolute h-1 bg-blue-500 rounded-full"
                    style={{ width: `${localFilters.maxDistance}%` }}
                  />
                  {/* Thumb */}
                  <div 
                    className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-sm"
                    style={{ left: `${localFilters.maxDistance}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>1 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleClear}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleApply}
                  className="flex-[2] py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
