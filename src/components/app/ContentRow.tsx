'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  children: React.ReactNode;
  showMore?: () => void;
}

export default function ContentRow({ title, children, showMore }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        {showMore && (
          <button
            onClick={showMore}
            className="text-sm text-[#e50914] hover:underline"
          >
            عرض المزيد
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:bg-black"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:bg-black"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
