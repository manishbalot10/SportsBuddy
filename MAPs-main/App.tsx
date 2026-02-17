import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Map, ScalableMap } from './components/Map';
import { PlayerCard } from './components/PlayerCard';
// import { CoachCard } from './components/CoachCard'; // Commented out - not needed now
import { FilterPanel } from './components/FilterPanel';
import { USER_LOCATION } from './constants';
import { Player, FilterState, SkillLevel } from './types';
// import { Coach } from './types'; // Commented out - not needed now

// Toggle between scalable (server-side clustering) and legacy mode
const USE_SCALABLE_MAP = true;

function App() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'markers' | 'density'>('markers');
  // const [userTypeView, setUserTypeView] = useState<'players' | 'coaches'>('players'); // Commented out - not needed now
  // const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null); // Commented out - not needed now
  const [connectedPlayerIds, setConnectedPlayerIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [playersWithinDistance, setPlayersWithinDistance] = useState(0);

  // Initial Filters
  const [filters, setFilters] = useState<FilterState>({
    sport: 'All',
    levels: {
      Beginner: true,
      Intermediate: true,
      Advanced: true,
      Professional: true
    },
    maxDistance: 5 // km - default to 5km for better local discovery
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
          limit: '100' // Reduced for faster loading
        });

        if (filters.sport !== 'All') {
          params.append('sport', filters.sport);
        }

        if (filters.userType && filters.userType !== 'all') {
          params.append('role', filters.userType === 'players' ? 'player' : 'coach');
        }

        const response = await fetch(`http://localhost:8080/api/users/nearby?${params.toString()}`);
        const data = await response.json();
        // API loaded

        if (data.users && data.users.length > 0) {
          setAllPlayers(data.users);
          setFilteredPlayers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchPlayers, 100);
    return () => clearTimeout(debounceFetch);
  }, [filters.sport, filters.maxDistance, filters.userType]); // Refetch when API-relevant filters change

  // WebSocket removed - Java backend uses REST API only
  // Real-time updates can be added later via polling or Server-Sent Events

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

    // 2. Level Filter - make it robust (allow if level not in filters)
    result = result.filter(p => {
      const levelKey = p.level as keyof typeof filters.levels;
      return filters.levels[levelKey] !== false; // Allow if true or undefined
    });
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
      <Header />

      {/* Main Map Area - Scalable or Legacy */}
      <div className="absolute inset-0 z-0">
        {USE_SCALABLE_MAP ? (
          <ScalableMap
            onPlayerSelect={setSelectedPlayer}
            onMapClick={() => setSelectedPlayer(null)}
            onTotalChange={(total) => setPlayersWithinDistance(total)}
            sport={filters.sport}
            viewMode={viewMode}
            maxDistance={filters.maxDistance}
            userType={filters.userType}
          />
        ) : (
          <Map
            players={filteredPlayers}
            onPlayerSelect={setSelectedPlayer}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* View Toggle - Commented out - not needed now */}
      {/* <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[800] flex bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setUserTypeView('players')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            userTypeView === 'players' 
              ? 'text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          style={userTypeView === 'players' ? { backgroundColor: '#E17827' } : {}}
        >
          Players
        </button>
        <button
          onClick={() => setUserTypeView('coaches')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            userTypeView === 'coaches' 
              ? 'text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          style={userTypeView === 'coaches' ? { backgroundColor: '#00B0F0' } : {}}
        >
          Coaches
        </button>
      </div> */}

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        playerCount={USE_SCALABLE_MAP ? playersWithinDistance : filteredPlayers.length}
        isLoading={isLoading}
        onExpand={() => setSelectedPlayer(null)}
      />

      {/* Players only - Coaches commented out */}
      <PlayerCard
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        isConnected={selectedPlayer ? connectedPlayerIds.has(selectedPlayer.id) : false}
        onConnect={handleConnect}
      />
      {/* <CoachCard 
        coach={selectedCoach}
        onClose={() => setSelectedCoach(null)}
      /> */}

    </div>
  );
}

export default App;