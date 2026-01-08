import React, { useState, useEffect } from 'react';
import { Coach } from '../types';
import { SPORTS_CONFIG, USER_LOCATION } from '../constants';
import { DownloadPrompt } from './DownloadPrompt';

interface CoachCardProps {
  coach: Coach | null;
  onClose: () => void;
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

export const CoachCard: React.FC<CoachCardProps> = ({ coach, onClose }) => {
  const [displayCoach, setDisplayCoach] = useState<Coach | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  useEffect(() => {
    if (coach) {
      setDisplayCoach(coach);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [coach]);

  if (!displayCoach) return null;

  const sportEmoji = SPORT_EMOJI[displayCoach.sport] || '🏅';
  const distance = displayCoach.distance_km ?? calculateDistance(
    USER_LOCATION.latitude, USER_LOCATION.longitude,
    displayCoach.latitude, displayCoach.longitude
  );

  return (
    <>
      <div
        className={`fixed bottom-4 left-4 right-4 z-[1000] transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
        style={{ maxWidth: '420px', margin: '0 auto' }}
      >
        {/* Asymmetric Card - Left accent bar design */}
        <div className="relative bg-white overflow-hidden" style={{ borderRadius: '20px' }}>
          {/* Left accent bar - emerald for coaches */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ background: 'linear-gradient(180deg, #059669 0%, #10b981 100%)' }}
          />
          
          {/* Large background emoji - subtle */}
          <div 
            className="absolute -right-8 -bottom-8 text-[140px] opacity-[0.04] pointer-events-none select-none"
            style={{ lineHeight: 1 }}
          >
            {sportEmoji}
          </div>

          {/* Content */}
          <div className="pl-6 pr-5 py-5">
            {/* Top row: Close button aligned right */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Coach info - asymmetric layout */}
            <div className="space-y-4">
              {/* Name and badge row */}
              <div className="flex items-start gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}
                >
                  🎓
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                    {displayCoach.specialization}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {displayCoach.sport} Coach
                  </h3>
                </div>
              </div>

              {/* Stats row - horizontal */}
              <div className="flex items-center gap-6 py-3 border-y border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{displayCoach.experience_years}</div>
                  <div className="text-xs text-gray-500">Years Exp</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{displayCoach.students_trained || '50'}+</div>
                  <div className="text-xs text-gray-500">Trained</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900">{displayCoach.rating || '4.8'}</span>
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>

              {/* Location and distance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {displayCoach.city}
                </div>
                <div className="text-sm font-semibold text-emerald-600">
                  {distance} km away
                </div>
              </div>

              {/* Certifications */}
              {displayCoach.certifications && displayCoach.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {displayCoach.certifications.slice(0, 2).map((cert, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => setShowDownloadPrompt(true)}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDownloadPrompt && (
        <DownloadPrompt 
          isOpen={showDownloadPrompt} 
          onClose={() => setShowDownloadPrompt(false)} 
          playerName={displayCoach.name}
        />
      )}
    </>
  );
};
