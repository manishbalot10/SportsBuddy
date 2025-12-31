import React, { useState } from 'react';
import { FilterState, SportType, SkillLevel } from '../types';
import { SPORTS_CONFIG } from '../constants';
import { Filter, X, Check, Star, TrendingUp, Zap, Trophy, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const LEVEL_CONFIG: Record<SkillLevel, { icon: React.ElementType, color: string }> = {
  Beginner: { icon: Star, color: 'text-emerald-500' },
  Intermediate: { icon: TrendingUp, color: 'text-blue-500' },
  Advanced: { icon: Zap, color: 'text-purple-500' },
  Professional: { icon: Trophy, color: 'text-amber-500' }
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLevel = (level: SkillLevel) => {
    onFilterChange({
      ...filters,
      levels: {
        ...filters.levels,
        [level]: !filters.levels[level]
      }
    });
  };

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sport: e.target.value as SportType | 'All'
    });
  };

  return (
    <div className="absolute top-24 right-4 z-[800] flex flex-col items-end pointer-events-none">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 flex items-center justify-center hover:scale-105 transition-all text-gray-700 dark:text-gray-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="pointer-events-auto mt-3 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-200 border border-gray-100 dark:border-zinc-800">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
               <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                 {Object.values(filters.levels).filter(Boolean).length} Active
               </span>
            </div>

            {/* Sport Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Sport Category</label>
              <div className="relative">
                <select 
                    value={filters.sport}
                    onChange={handleSportChange}
                    className="w-full p-3.5 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium appearance-none cursor-pointer"
                >
                    <option value="All">All Sports</option>
                    {Object.keys(SPORTS_CONFIG).map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Level Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Skill Level</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced', 'Professional'] as SkillLevel[]).map((level) => {
                  const Config = LEVEL_CONFIG[level];
                  const Icon = Config.icon;
                  const isSelected = filters.levels[level];
                  
                  return (
                    <div 
                      key={level}
                      onClick={() => toggleLevel(level)}
                      className={`
                        cursor-pointer relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 select-none
                        ${isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/50 shadow-sm' 
                          : 'bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                        }
                      `}
                    >
                      {/* Checkbox circle */}
                      <div className={`
                        w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors
                        ${isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 dark:border-zinc-600 bg-transparent'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                         <div className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            {level}
                         </div>
                      </div>
                      
                      <Icon className={`w-4 h-4 ${Config.color} opacity-80`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Max Distance</label>
                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                    {filters.maxDistance} km
                </span>
              </div>
              <div className="relative h-6 flex items-center select-none">
                 <div className="absolute w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 rounded-full transition-all" 
                        style={{ width: `${filters.maxDistance}%` }} 
                    />
                 </div>
                 <input 
                    type="range"
                    min="1"
                    max="100"
                    value={filters.maxDistance}
                    onChange={(e) => onFilterChange({...filters, maxDistance: parseInt(e.target.value)})}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div 
                    className="absolute h-5 w-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none transition-all z-20"
                    style={{ left: `calc(${filters.maxDistance}% - 10px)` }}
                 />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
