import React, { useState } from 'react';
import { FilterState, SportType, SkillLevel } from '../types';
import { SPORTS_CONFIG } from '../constants';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// SVG Icons from mockup
const ICONS = {
  Beginner: (
    <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Intermediate: (
    <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Advanced: (
    <svg className="h-6 w-6 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path clipRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" fillRule="evenodd" />
    </svg>
  ),
  Professional: (
    <svg className="h-6 w-6 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path clipRule="evenodd" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v2h1a2 2 0 110 4h-1c-.41 3.96-3.32 7.15-7.21 7.46V20h3a1 1 0 110 2H8a1 1 0 110-2h3v-2.54C7.32 17.15 4.41 13.96 4 10H3a2 2 0 110-4h1V4zm2 2v4a5 5 0 0010 0V6H7z" fillRule="evenodd" />
    </svg>
  ),
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local state when prop updates externally
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
    // Optional: Auto-apply on clear or let user click apply?
    // Let's just update local state so they can click apply
  };

  return (
    <>
      {/* Trigger Button - Floating (Top Right) */}
      <div className="absolute top-24 right-4 z-[800]">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-gray-200/50 flex items-center justify-center hover:scale-105 transition-all text-gray-700"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Backdrop & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <section className="relative bg-white w-full max-w-[420px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 rounded-[24px]">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Filters</h1>
              <button 
                onClick={handleClear}
                className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-100 mb-6" />

            {/* Scrollable Content Area */}
            <div className="px-6 pb-6 space-y-7 max-h-[70vh] overflow-y-auto no-scrollbar">
              
              {/* Filter Section: Sport Category */}
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sport Category</h2>
                <div className="relative">
                  <select 
                    value={localFilters.sport}
                    onChange={(e) => setLocalFilters({...localFilters, sport: e.target.value as SportType | 'All'})}
                    className="w-full bg-gray-50 hover:bg-gray-100 transition-colors text-left px-5 py-4 rounded-2xl flex justify-between items-center appearance-none font-semibold text-lg text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Sports</option>
                    {Object.keys(SPORTS_CONFIG).map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={20} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Filter Section: Skill Level */}
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Skill Level</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Professional'] as SkillLevel[]).map((level) => {
                    const isSelected = localFilters.levels[level];
                    return (
                      <label key={level} className="cursor-pointer relative group">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={isSelected}
                          onChange={() => toggleLevel(level)}
                        />
                        <div className={`
                          flex items-center px-3 py-3 rounded-xl border-2 bg-white shadow-sm ring-1 ring-gray-200 transition-all
                          ${isSelected 
                            ? 'border-[#2563EB] bg-blue-50 ring-0' 
                            : 'border-transparent group-hover:bg-gray-50'
                          }
                        `}>
                          <div className={`
                            w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-white transition-colors mr-3
                            ${isSelected ? 'bg-[#2563EB]' : 'bg-gray-200'}
                          `}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-700 text-sm flex-1 text-center">{level}</span>
                          {ICONS[level]}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter Section: Max Distance */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Max Distance</h2>
                  <div className="bg-blue-100 text-[#1E40AF] font-bold text-sm px-3 py-1 rounded-lg">
                    {localFilters.maxDistance} km
                  </div>
                </div>
                <div className="relative w-full h-6 flex items-center">
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    value={localFilters.maxDistance}
                    onChange={(e) => setLocalFilters({...localFilters, maxDistance: parseInt(e.target.value)})}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {/* Background Track */}
                  <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
                  {/* Active Track */}
                  <div 
                    className="absolute h-1.5 bg-[#2563EB] rounded-full pointer-events-none" 
                    style={{ width: `${localFilters.maxDistance}%` }} 
                  />
                  {/* Thumb/Knob */}
                  <div 
                    className="absolute h-6 w-6 bg-white rounded-full shadow-md pointer-events-none transition-transform"
                    style={{ 
                      left: `${localFilters.maxDistance}%`,
                      transform: 'translateX(-50%)'
                    }} 
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button 
                onClick={handleApply}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
              >
                Apply Filters
              </button>

            </div>
          </section>
        </div>
      )}
    </>
  );
};
