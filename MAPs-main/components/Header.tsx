import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="absolute top-4 left-4 right-4 z-[900] flex items-start justify-end pointer-events-none">
      
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