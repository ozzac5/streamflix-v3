'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/app/Header';
import BottomNav from '@/components/app/BottomNav';
import BannerSlider from '@/components/app/BannerSlider';
import ContentRow from '@/components/app/ContentRow';
import MovieCard from '@/components/app/MovieCard';
import SeriesCard from '@/components/app/SeriesCard';
import ChannelCard from '@/components/app/ChannelCard';
import SearchModal from '@/components/app/SearchModal';
import VideoPlayer from '@/components/app/VideoPlayer';
import { X, Star, Clock, Calendar, Play } from 'lucide-react';

// Types
interface Movie {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  videoUrl?: string | null;
  year?: number | null;
  duration?: number | null;
  imdbRating?: number | null;
  quality?: string | null;
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: { name: string } | null;
}

interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  year?: number | null;
  imdbRating?: number | null;
  status?: string | null;
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: { name: string } | null;
  seasons?: Season[];
  _count?: { seasons: number };
}

interface Season {
  id: string;
  seasonNumber: number;
  title?: string | null;
  episodes: Episode[];
}

interface Episode {
  id: string;
  episodeNumber: number;
  title?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
}

interface Channel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  streamUrl?: string | null;
  country?: string | null;
  isLive?: boolean;
  category?: { name: string } | null;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  movieId?: string | null;
  seriesId?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [activeTab, setActiveNav] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerTab, setHeaderTab] = useState('HOME');
  
  // Data states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMovies, setCategoryMovies] = useState<Record<string, Movie[]>>({});
  
  // Modal states
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, moviesRes, trendingMoviesRes, seriesRes, channelsRes, categoriesRes] = await Promise.all([
          fetch('/api/banners'),
          fetch('/api/movies?featured=true&limit=10'),
          fetch('/api/movies?trending=true&limit=10'),
          fetch('/api/series?trending=true&limit=10'),
          fetch('/api/channels?limit=10'),
          fetch('/api/categories'),
        ]);
        
        const bannersData = await bannersRes.json();
        const moviesData = await moviesRes.json();
        const trendingMoviesData = await trendingMoviesRes.json();
        const seriesData = await seriesRes.json();
        const channelsData = await channelsRes.json();
        const categoriesData = await categoriesRes.json();
        
        // Use placeholder images for banners if no real images
        const bannersWithPlaceholders = bannersData.map((banner: Banner, index: number) => ({
          ...banner,
          imageUrl: banner.imageUrl || `/api/placeholder/1200/600?text=${encodeURIComponent(banner.title)}`
        }));
        
        setBanners(bannersWithPlaceholders);
        setFeaturedMovies(moviesData.movies || []);
        setTrendingMovies(trendingMoviesData.movies || []);
        setTrendingSeries(seriesData.series || []);
        setChannels(channelsData || []);
        setCategories(categoriesData || []);
        
        // Fetch movies for each category
        if (categoriesData && categoriesData.length > 0) {
          const categoryMoviesData: Record<string, Movie[]> = {};
          for (const cat of categoriesData.slice(0, 3)) {
            const res = await fetch(`/api/movies?categoryId=${cat.id}&limit=10`);
            const data = await res.json();
            if (data.movies && data.movies.length > 0) {
              categoryMoviesData[cat.id] = data.movies;
            }
          }
          setCategoryMovies(categoryMoviesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle URL params for movie/series/channel details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movie');
    const seriesId = params.get('series');
    const channelId = params.get('channel');
    
    const fetchDetail = async () => {
      if (movieId) {
        const res = await fetch(`/api/movies/${movieId}`);
        const data = await res.json();
        setSelectedMovie(data);
      } else if (seriesId) {
        const res = await fetch(`/api/series/${seriesId}`);
        const data = await res.json();
        setSelectedSeries(data);
      } else if (channelId) {
        const res = await fetch(`/api/channels/${channelId}`);
        const data = await res.json();
        setSelectedChannel(data);
        setIsPlaying(true);
      }
    };
    
    fetchDetail();
  }, []);

  const handleHeaderTabChange = (tab: string) => {
    setHeaderTab(tab);
    if (tab === 'LIVE TV') {
      setActiveNav('live');
    } else if (tab === 'EXPLORE') {
      setActiveNav('explore');
    } else {
      setActiveNav('home');
    }
  };

  const closeModals = () => {
    setSelectedMovie(null);
    setSelectedSeries(null);
    setSelectedChannel(null);
    setSelectedEpisode(null);
    setIsPlaying(false);
    // Clear URL params
    window.history.pushState({}, '', '/');
  };

  const playContent = () => {
    setIsPlaying(true);
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins} دقيقة`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <Header 
        onSearchClick={() => setSearchOpen(true)} 
        activeTab={headerTab}
      />
      
      {/* Banner Slider */}
      {banners.length > 0 && <BannerSlider banners={banners} />}
      
      {/* Content Sections */}
      <div className="space-y-8 mt-6">
        {/* Now Playing / Featured Movies */}
        {featuredMovies.length > 0 && (
          <ContentRow title="أفلام مميزة">
            {featuredMovies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-32 md:w-40" style={{ scrollSnapAlign: 'start' }}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </ContentRow>
        )}
        
        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <ContentRow title="أفلام رائجة">
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-32 md:w-40" style={{ scrollSnapAlign: 'start' }}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </ContentRow>
        )}
        
        {/* Trending Series */}
        {trendingSeries.length > 0 && (
          <ContentRow title="مسلسلات رائجة">
            {trendingSeries.map((series) => (
              <div key={series.id} className="flex-shrink-0 w-32 md:w-40" style={{ scrollSnapAlign: 'start' }}>
                <SeriesCard series={series} />
              </div>
            ))}
          </ContentRow>
        )}
        
        {/* Live Channels */}
        {channels.length > 0 && (
          <ContentRow title="قنوات مباشرة">
            {channels.map((channel) => (
              <div key={channel.id} className="flex-shrink-0 w-48 md:w-56" style={{ scrollSnapAlign: 'start' }}>
                <ChannelCard channel={channel} />
              </div>
            ))}
          </ContentRow>
        )}
        
        {/* Category Sections */}
        {Object.entries(categoryMovies).map(([catId, movies]) => {
          const category = categories.find(c => c.id === catId);
          if (!category || movies.length === 0) return null;
          
          return (
            <ContentRow key={catId} title={`${category.name}`}>
              {movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-32 md:w-40" style={{ scrollSnapAlign: 'start' }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </ContentRow>
          );
        })}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveNav} />
      
      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Movie Detail Modal */}
      {selectedMovie && !isPlaying && (
        <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto">
          <div className="min-h-screen">
            {/* Close Button */}
            <button
              onClick={closeModals}
              className="fixed top-4 left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Backdrop */}
            <div className="relative h-[40vh] min-h-[300px]">
              {selectedMovie.backdropUrl ? (
                <img
                  src={selectedMovie.backdropUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative -mt-32 px-4 md:px-8 pb-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {selectedMovie.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#a3a3a3]">
                  {selectedMovie.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedMovie.year}</span>
                    </div>
                  )}
                  {selectedMovie.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(selectedMovie.duration)}</span>
                    </div>
                  )}
                  {selectedMovie.imdbRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedMovie.imdbRating}</span>
                    </div>
                  )}
                  {selectedMovie.quality && (
                    <span className="px-2 py-0.5 bg-[#e50914] text-white text-xs font-bold rounded">
                      {selectedMovie.quality}
                    </span>
                  )}
                  {selectedMovie.category && (
                    <span className="px-2 py-0.5 bg-white/10 text-white text-xs rounded">
                      {selectedMovie.category.name}
                    </span>
                  )}
                </div>
                
                {/* Play Button */}
                {selectedMovie.videoUrl && (
                  <button
                    onClick={playContent}
                    className="flex items-center gap-2 px-8 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-lg mb-6 transition-colors"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>شاهد الآن</span>
                  </button>
                )}
                
                {/* Description */}
                {selectedMovie.description && (
                  <p className="text-white/80 leading-relaxed mb-6">
                    {selectedMovie.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {isPlaying && (selectedMovie || selectedChannel || selectedEpisode) && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setIsPlaying(false)}
            className="fixed top-4 left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer
              src={
                selectedMovie?.videoUrl || 
                selectedChannel?.streamUrl || 
                selectedEpisode?.videoUrl || 
                ''
              }
              poster={selectedMovie?.backdropUrl || selectedChannel?.logoUrl || ''}
              autoPlay
            />
          </div>
        </div>
      )}
      
      {/* Series Detail Modal */}
      {selectedSeries && !isPlaying && (
        <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto">
          <div className="min-h-screen">
            {/* Close Button */}
            <button
              onClick={closeModals}
              className="fixed top-4 left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Backdrop */}
            <div className="relative h-[40vh] min-h-[300px]">
              {selectedSeries.backdropUrl ? (
                <img
                  src={selectedSeries.backdropUrl}
                  alt={selectedSeries.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative -mt-32 px-4 md:px-8 pb-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {selectedSeries.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#a3a3a3]">
                  {selectedSeries.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedSeries.year}</span>
                    </div>
                  )}
                  {selectedSeries._count && (
                    <span>{selectedSeries._count.seasons} مواسم</span>
                  )}
                  {selectedSeries.imdbRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedSeries.imdbRating}</span>
                    </div>
                  )}
                  {selectedSeries.status && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      selectedSeries.status === 'ongoing' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {selectedSeries.status === 'ongoing' ? 'مستمر' : 'مكتمل'}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {selectedSeries.description && (
                  <p className="text-white/80 leading-relaxed mb-6">
                    {selectedSeries.description}
                  </p>
                )}
                
                {/* Seasons & Episodes */}
                {selectedSeries.seasons && selectedSeries.seasons.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">المواسم والحلقات</h2>
                    
                    {selectedSeries.seasons.map((season) => (
                      <div key={season.id} className="bg-[#141414] rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {season.title || `الموسم ${season.seasonNumber}`}
                        </h3>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {season.episodes.map((episode) => (
                            <button
                              key={episode.id}
                              onClick={() => {
                                setSelectedEpisode(episode);
                                setIsPlaying(true);
                              }}
                              className="aspect-square rounded-lg bg-[#1a1a1a] hover:bg-[#e50914] transition-colors flex flex-col items-center justify-center text-white"
                            >
                              <span className="text-sm font-semibold">{episode.episodeNumber}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
