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

// --- StapuBox Website Palette (orange-led) ---
const STAPU_COLORS = {
  cardBg: '#1C1C1C',        // brand-ish dark
  border: 'rgba(255,255,255,0.06)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#8B8B8B',
  brandOrange: '#E6862E',   // website CTA orange
  brandOrangeDeep: '#D9771F',
  brandBlue: '#37A9E1',     // website accent blue (use sparingly)
  statusGreen: '#22C55E',
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

  return (
    <>
      {/* Floating Card - Compact & Premium */}
      <div
        className={`fixed bottom-4 left-4 right-4 z-[1000] transition-all duration-400 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ maxWidth: '440px', margin: '0 auto' }}
      >
        <div
          className="relative"
          style={{
            background: STAPU_COLORS.cardBg,
            borderRadius: '18px',
            boxShadow: '0px 14px 34px rgba(0, 0, 0, 0.38)',
            border: `1px solid ${STAPU_COLORS.border}`,
          }}
        >
          {/* Close (better contrast like we discussed) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center transition-all"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => ((e.currentTarget.style.color = '#FFFFFF'))}
            onMouseLeave={(e) => ((e.currentTarget.style.color = '#9CA3AF'))}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </button>

          <div className="p-4 flex items-center gap-3">
            {/* Avatar with ORANGE ring (brand-aligned) */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full p-[2px] overflow-hidden"
                style={{ background: STAPU_COLORS.brandOrange }}
              >
                <img
                  src={displayPlayer.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                  style={{ 
                    border: `2px solid ${STAPU_COLORS.cardBg}`,
                    filter: 'blur(4px)', // Frosted/Anonymous effect
                    transform: 'scale(1.1)' // Prevent blurred edges
                  }}
                />
              </div>

              {/* Active Status Indicator */}
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                style={{
                  background: STAPU_COLORS.statusGreen,
                  border: `2px solid ${STAPU_COLORS.cardBg}`,
                  zIndex: 10
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-[15px] font-semibold truncate leading-tight" style={{ color: STAPU_COLORS.textPrimary }}>
                {displayPlayer.level} {displayPlayer.sport} Player
              </h3>

              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                {/* subtle blue micro-accent */}
                <span className="text-[13px]" style={{ color: STAPU_COLORS.brandBlue }}>
                  {sportEmoji}
                </span>

                <span className="text-[13px] truncate" style={{ color: STAPU_COLORS.textSecondary }}>
                  {displayPlayer.city}
                  <span style={{ color: STAPU_COLORS.textTertiary }}> · {distance}km away</span>
                </span>
              </div>
            </div>

            {/* CTA — ORANGE like website (most important change) */}
            <button
              onClick={() => setShowDownloadPrompt(true)}
              className="flex-shrink-0 h-9 px-5 rounded-full text-[13px] font-semibold text-white transition-all active:scale-95 hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${STAPU_COLORS.brandOrange}, ${STAPU_COLORS.brandOrangeDeep})`,
                boxShadow: '0 6px 16px rgba(230, 134, 46, 0.28)',
              }}
            >
              Connect
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
