'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  movieId?: string | null;
  seriesId?: string | null;
  linkUrl?: string | null;
}

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentSlide];
  const href = currentBanner.movieId 
    ? `/?movie=${currentBanner.movieId}` 
    : currentBanner.seriesId 
    ? `/?series=${currentBanner.seriesId}`
    : currentBanner.linkUrl || '#';

  return (
    <div className="relative w-full h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="relative flex-shrink-0 w-full h-full">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-base md:text-lg text-white/80 mb-4 drop-shadow">
                    {banner.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mt-4">
                  <Link
                    href={href}
                    className="flex items-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>شاهد الآن</span>
                  </Link>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg backdrop-blur-sm transition-colors">
                    <Info className="w-5 h-5" />
                    <span>تفاصيل</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentSlide === index
                  ? 'bg-[#e50914] w-6'
                  : 'bg-white/50 hover:bg-white/80'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
