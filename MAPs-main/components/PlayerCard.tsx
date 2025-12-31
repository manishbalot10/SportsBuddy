import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { SPORTS_CONFIG, USER_LOCATION } from '../constants';
import { X, MessageCircle, UserPlus, MapPin, Award, Share2, Compass } from 'lucide-react';

interface PlayerCardProps {
  player: Player | null;
  onClose: () => void;
  isConnected: boolean;
  onConnect: (playerId: number) => void;
}

// Haversine formula for distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose, isConnected, onConnect }) => {
  const [displayPlayer, setDisplayPlayer] = useState<Player | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cachedConnected, setCachedConnected] = useState(false);

  useEffect(() => {
    if (player) {
      setDisplayPlayer(player);
      setCachedConnected(isConnected);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [player]);

  useEffect(() => {
    if (player) {
      setCachedConnected(isConnected);
    }
  }, [isConnected, player]);

  const handleConnectClick = () => {
    window.location.href = "https://stapubox.com";
  };

  if (!displayPlayer) return null;

  const SportIcon = SPORTS_CONFIG[displayPlayer.sport].icon;
  // Use API provided distance or fallback to client-side calculation
  const distance = displayPlayer.distance_km ?? calculateDistance(
    USER_LOCATION.latitude, 
    USER_LOCATION.longitude, 
    displayPlayer.latitude, 
    displayPlayer.longitude
  );

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center sm:items-center transition-all duration-300 ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Card */}
      <div 
        className={`bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative m-0 sm:m-4 transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isVisible ? 'translate-y-0' : 'translate-y-[110%] sm:translate-y-[120%]'}`}
      >
        {/* Grab Handle */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          
          {/* Main Profile Info */}
          <div className="flex gap-4 items-start mb-6">
            <div className="relative">
              <img 
                src={displayPlayer.avatar} 
                alt={displayPlayer.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-md"
              />
              <div 
                className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border-2 border-white dark:border-zinc-900 ${SPORTS_CONFIG[displayPlayer.sport].color} text-white shadow-sm animate-subtle-bounce`}
              >
                <SportIcon size={14} />
              </div>
            </div>
            
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{displayPlayer.name}</h2>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={14} className="text-blue-500" />
                <span>{displayPlayer.city}</span>
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-blue-500 font-medium">{distance} km</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                 <button className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                    <Share2 size={16} />
                 </button>
                 <button className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                    <Compass size={16} />
                 </button>
              </div>
            </div>
          </div>

          {/* Stats Grid - "Attraction" style from the image reference concept */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                    <div className="text-orange-500 mb-1">
                       <Award size={20} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Skill Level</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{displayPlayer.level}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <div className="text-blue-500 mb-1">
                       <SportIcon size={20} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Sport</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{displayPlayer.sport}</div>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleConnectClick}
              className="flex-1 bg-blue-600 text-white py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <UserPlus size={18} />
              Connect
            </button>
            <button className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-95">
              <MessageCircle size={18} />
              Message
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(-20%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-subtle-bounce {
          animation: subtle-bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};