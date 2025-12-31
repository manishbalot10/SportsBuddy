import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Map } from './components/Map';
import { PlayerCard } from './components/PlayerCard';
import { FilterPanel } from './components/FilterPanel';
import { USER_LOCATION } from './constants';
import { Player, FilterState, SkillLevel } from './types';

function App() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'markers' | 'density'>('markers');
  const [connectedPlayerIds, setConnectedPlayerIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial Filters
  const [filters, setFilters] = useState<FilterState>({
    sport: 'All',
    levels: {
      Beginner: true,
      Intermediate: true,
      Advanced: true,
      Professional: true
    },
    maxDistance: 50 // km
  });

  // Fetch Data from API
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams({
          lat: USER_LOCATION.latitude.toString(),
          lng: USER_LOCATION.longitude.toString(),
          radius: filters.maxDistance.toString(),
          limit: '1000' // Fetch more to allow client-side filtering
        });

        if (filters.sport !== 'All') {
          params.append('sport', filters.sport);
        }

        const response = await fetch(`http://localhost:8000/api/users/nearby?${params.toString()}`);
        const data = await response.json();
        
        if (data.users) {
          setAllPlayers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(debounceFetch);
  }, [filters.sport, filters.maxDistance]); // Refetch when API-relevant filters change

  // Client-side Filter Logic (Search + Levels)
  useEffect(() => {
    let result = allPlayers;

    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sport.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }

    // 2. Level Filter
    result = result.filter(p => filters.levels[p.level]);

    // 3. Distance Filter is handled by API, but we can double check or just trust API
    // The API returns users within maxDistance, so no need to re-filter strictly if API works.
    
    setFilteredPlayers(result);
  }, [allPlayers, searchQuery, filters.levels]);

  const handleConnect = (playerId: number) => {
    setConnectedPlayerIds(prev => {
      const newSet = new Set(prev);
      newSet.add(playerId);
      return newSet;
    });
  };

  return (
    <div className="relative h-screen w-full bg-gray-100 dark:bg-zinc-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100">
      {/* Floating Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Main Map Area */}
      <div className="absolute inset-0 z-0">
        <Map 
          players={filteredPlayers}
          onPlayerSelect={setSelectedPlayer}
          viewMode={viewMode}
        />
      </div>

      {/* View Toggle - Minimalist Pill */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[800] flex bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setViewMode('markers')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            viewMode === 'markers' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setViewMode('density')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            viewMode === 'density' 
              ? 'bg-orange-500 text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Heatmap
        </button>
      </div>
        
      <FilterPanel 
        filters={filters}
        onFilterChange={setFilters}
      />

      <PlayerCard 
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        isConnected={selectedPlayer ? connectedPlayerIds.has(selectedPlayer.id) : false}
        onConnect={handleConnect}
      />

      {/* Loading / Count Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-500 pointer-events-none flex items-center gap-2">
        {isLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>}
        Showing {filteredPlayers.length} players nearby
      </div>
    </div>
  );
}

export default App;