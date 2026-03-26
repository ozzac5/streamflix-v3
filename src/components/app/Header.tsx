'use client';

import { useState } from 'react';
import { Search, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearchClick: () => void;
  activeTab?: string;
}

export default function Header({ onSearchClick, activeTab = 'HOME' }: HeaderProps) {
  const tabs = [
    { id: 'HOME', label: 'HOME' },
    { id: 'LIVE TV', label: 'LIVE TV' },
    { id: 'EXPLORE', label: 'EXPLORE' },
    { id: 'SPORTS', label: 'SPORTS' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#e50914]">StreamFlix</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="TV"
          >
            <Tv className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center justify-center gap-1 pb-2 px-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-[#e50914] text-white'
                : 'text-[#a3a3a3] hover:text-white hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
