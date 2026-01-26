import React from 'react';
import { X, Smartphone, Apple } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface DownloadPromptProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
  profileUrl?: string;
}

export const DownloadPrompt: React.FC<DownloadPromptProps> = ({ isOpen, onClose, playerName, profileUrl }) => {
  if (!isOpen) return null;

  // Build app store URLs with profile URL as parameter
  const buildAppStoreUrl = (store: 'ios' | 'android') => {
    const baseUrl = store === 'ios' 
      ? 'https://apps.apple.com/app/sportsbuddy'
      : 'https://play.google.com/store/apps/details?id=com.sportsbuddy';
    
    if (profileUrl) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}redirect=${encodeURIComponent(profileUrl)}`;
    }
    return baseUrl;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden transform transition-all scale-100">
        <div className="relative h-32 bg-blue-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-600 to-blue-600"></div>
            <Smartphone size={64} className="text-white relative z-10" />
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {playerName ? `Connect with ${playerName}` : 'Get the Full Experience'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {playerName 
                ? `Download SportsBuddy to view ${playerName}'s full profile, chat, and play together.`
                : 'Download the SportsBuddy app to connect, chat, and play with sports enthusiasts near you.'
              }
            </p>
            
            <div className="space-y-3">
                <a 
                    href={buildAppStoreUrl('ios')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-3 w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    onClick={() => trackEvent('download_click', { store: 'app_store', profileUrl })}
                >
                    <Apple size={24} />
                    <span>App Store</span>
                </a>
                <a 
                    href={buildAppStoreUrl('android')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-3 w-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => trackEvent('download_click', { store: 'google_play', profileUrl })}
                >
                    <Smartphone size={24} className="text-green-600" />
                    <span>Google Play</span>
                </a>
                {profileUrl && (
                  <a 
                      href={profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-3 w-full bg-[#E17827] text-white py-3 rounded-xl font-semibold hover:bg-[#d16a1f] transition-colors"
                      onClick={() => trackEvent('profile_link_click', { profileUrl })}
                  >
                      <span>View Profile</span>
                  </a>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
