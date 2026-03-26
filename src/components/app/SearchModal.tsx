'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Film, Tv, Radio } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  movies: Array<{
    id: string;
    title: string;
    posterUrl?: string | null;
    year?: number | null;
  }>;
  series: Array<{
    id: string;
    title: string;
    posterUrl?: string | null;
    year?: number | null;
  }>;
  channels: Array<{
    id: string;
    name: string;
    logoUrl?: string | null;
  }>;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ movies: [], series: [], channels: [] });
  const [isLoading, setIsLoading] = useState(false);

  const searchDebounced = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ movies: [], series: [], channels: [] });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDebounced(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchDebounced]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasResults = results.movies.length > 0 || results.series.length > 0 || results.channels.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أفلام، مسلسلات، قنوات..."
              className="w-full pl-12 pr-4 py-3 bg-[#141414] border border-white/10 rounded-full text-white placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#e50914]"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a3a3a3] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!isLoading && hasResults && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Movies */}
            {results.movies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Film className="w-5 h-5 text-[#e50914]" />
                  <h3 className="text-lg font-semibold text-white">أفلام</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.movies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={`/?movie=${movie.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 bg-[#141414] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {movie.posterUrl ? (
                          <Image
                            src={movie.posterUrl}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Film className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                        {movie.year && (
                          <p className="text-xs text-[#a3a3a3]">{movie.year}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {results.series.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-5 h-5 text-[#e50914]" />
                  <h3 className="text-lg font-semibold text-white">مسلسلات</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.series.map((series) => (
                    <Link
                      key={series.id}
                      href={`/?series=${series.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 bg-[#141414] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {series.posterUrl ? (
                          <Image
                            src={series.posterUrl}
                            alt={series.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Tv className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate">{series.title}</p>
                        {series.year && (
                          <p className="text-xs text-[#a3a3a3]">{series.year}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Channels */}
            {results.channels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-5 h-5 text-[#e50914]" />
                  <h3 className="text-lg font-semibold text-white">قنوات</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.channels.map((channel) => (
                    <Link
                      key={channel.id}
                      href={`/?channel=${channel.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 bg-[#141414] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {channel.logoUrl ? (
                          <Image
                            src={channel.logoUrl}
                            alt={channel.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Radio className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">{channel.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query.length >= 2 && !hasResults && (
          <div className="flex flex-col items-center justify-center py-12 text-[#a3a3a3]">
            <Search className="w-12 h-12 mb-4" />
            <p>لا توجد نتائج لـ &quot;{query}&quot;</p>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && query.length < 2 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#a3a3a3]">
            <Search className="w-12 h-12 mb-4" />
            <p>اكتب للبحث عن أفلام، مسلسلات أو قنوات</p>
          </div>
        )}
      </div>
    </div>
  );
}
