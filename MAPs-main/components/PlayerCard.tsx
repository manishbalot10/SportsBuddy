import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { SPORTS_CONFIG, USER_LOCATION } from '../constants';
import { DownloadPrompt } from './DownloadPrompt';

interface PlayerCardProps {
  player: Player | null;
  onClose: () => void;
  isConnected: boolean;
  onConnect: (playerId: number) => void;
}

const SPORT_EMOJI: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Hockey: '🏑', Badminton: '🏸', Tennis: '🎾',
  'Table Tennis': '🏓', Basketball: '🏀', Volleyball: '🏐', Swimming: '🏊',
  Running: '🏃', Cycling: '🚴', Boxing: '🥊', Wrestling: '🤼', Yoga: '🧘',
  Chess: '♟️', Golf: '⛳', Archery: '🏹', Athletics: '🏃', Gymnastics: '🤸',
  'Martial Arts': '🥋', Weightlifting: '🏋️', Handball: '🤾', Baseball: '⚾',
  Kabaddi: '🤼', 'Kho Kho': '🏃', Squash: '🎾', Marathon: '🏃',
  Throwball: '🏐', Carrom: '🎯', Shooting: '🎯',
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

// Skill level icons and colors matching the filter design
const LEVEL_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  Beginner: {
    color: '#22c55e',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
  },
  Intermediate: {
    color: '#3b82f6',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  Advanced: {
    color: '#a855f7',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
  },
  Professional: {
    color: '#f97316',
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v2h1a2 2 0 110 4h-1c-.41 3.96-3.32 7.15-7.21 7.46V20h3a1 1 0 110 2H8a1 1 0 110-2h3v-2.54C7.32 17.15 4.41 13.96 4 10H3a2 2 0 110-4h1V4zm2 2v4a5 5 0 0010 0V6H7z"/></svg>
  },
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose }) => {
  const [displayPlayer, setDisplayPlayer] = useState<Player | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  useEffect(() => {
    if (player) {
      setDisplayPlayer(player);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [player]);

  if (!displayPlayer) return null;

  const sportEmoji = SPORT_EMOJI[displayPlayer.sport] || '🏅';
  const distance = displayPlayer.distance_km ?? calculateDistance(
    USER_LOCATION.latitude, USER_LOCATION.longitude,
    displayPlayer.latitude, displayPlayer.longitude
  );
  const levelConfig = LEVEL_CONFIG[displayPlayer.level] || LEVEL_CONFIG.Beginner;

  return (
    <>
      {/* White Floating Card - Modern Filter Style */}
      <div
        className={`fixed bottom-4 left-4 right-4 z-[1000] transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
        style={{ maxWidth: '420px', margin: '0 auto' }}
      >
        <div
          className="bg-white overflow-hidden"
          style={{
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Player Found</h2>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gray-100" />

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Player Info Row */}
            <div className="flex items-center gap-4">
              {/* Avatar with gradient ring */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-full p-[3px]"
                  style={{ background: `linear-gradient(135deg, #2563EB, ${levelConfig.color})` }}
                >
                  <img
                    src={displayPlayer.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover bg-white"
                    style={{ filter: 'blur(3px)', transform: 'scale(1.05)' }}
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full border-[3px] border-white" />
              </div>

              {/* Name & Location */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {displayPlayer.level} {displayPlayer.sport} Player
                </h3>
                <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {displayPlayer.city}
                </p>
              </div>

              {/* Distance Badge */}
              <div className="flex-shrink-0 bg-blue-100 text-[#1E40AF] font-bold text-sm px-3 py-1.5 rounded-lg">
                {distance} km
              </div>
            </div>

            {/* Sport & Level Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Sport Pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 ring-1 ring-gray-200">
                <span className="text-xl">{sportEmoji}</span>
                <span className="font-semibold text-gray-700 text-sm">{displayPlayer.sport}</span>
              </div>

              {/* Level Pill */}
              <div 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2"
                style={{ 
                  borderColor: '#2563EB',
                  backgroundColor: '#eff6ff'
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 text-sm">{displayPlayer.level}</span>
                <span style={{ color: levelConfig.color }}>{levelConfig.icon}</span>
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={() => setShowDownloadPrompt(true)}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              Connect on App
            </button>
          </div>
        </div>
      </div>

      {showDownloadPrompt && (
        <DownloadPrompt isOpen={showDownloadPrompt} onClose={() => setShowDownloadPrompt(false)} />
      )}
    </>
  );
};
