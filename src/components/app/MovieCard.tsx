'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    posterUrl?: string | null;
    year?: number | null;
    imdbRating?: number | null;
    quality?: string | null;
    isFeatured?: boolean;
    isTrending?: boolean;
  };
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link href={`/?movie=${movie.id}`} className={cn('group relative block', className)}>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#141414]">
        {/* Poster */}
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
            <span className="text-4xl font-bold text-white/20">
              {movie.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-[#e50914] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.quality && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded">
              {movie.quality}
            </span>
          )}
          {movie.isTrending && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500 text-black rounded">
              TRENDING
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-[#e50914] transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {movie.year && (
            <span className="text-xs text-[#a3a3a3]">{movie.year}</span>
          )}
          {movie.imdbRating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-[#a3a3a3]">{movie.imdbRating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
