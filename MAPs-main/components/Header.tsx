import React from 'react';
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="absolute top-4 left-4 right-4 z-[900] flex items-start justify-between pointer-events-none">
      
      {/* Floating Search Bar */}
      <div className="flex-1 max-w-lg pointer-events-auto">
        <div className="relative group shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-2xl bg-white dark:bg-zinc-900 transition-all duration-300">
          
          <div className="flex items-center p-1">
            {/* Menu Button / Icon */}
            <button className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Menu className="w-6 h-6" />
            </button>

            {/* Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-base font-medium py-2 px-2"
              placeholder="Search location..."
            />

            {/* Search Icon */}
            <div className="p-3">
               <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20">
                  <Search className="w-4 h-4" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Avatar (Right Side) */}
      <div className="ml-3 pointer-events-auto hidden sm:block">
         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-1 cursor-pointer hover:scale-105 transition-transform">
             <img 
               src="https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff" 
               alt="User" 
               className="w-full h-full rounded-xl object-cover"
             />
         </div>
      </div>
    </header>
  );
};