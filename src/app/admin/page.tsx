'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Film, Tv, Radio, Layers, ImageIcon, Settings, 
  BarChart3, Users, Eye, TrendingUp, 
  LogOut, Menu, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminStats {
  movies: number;
  series: number;
  channels: number;
  categories: number;
  banners: number;
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3, href: '/admin' },
  { id: 'movies', label: 'الأفلام', icon: Film, href: '/admin/movies' },
  { id: 'series', label: 'المسلسلات', icon: Tv, href: '/admin/series' },
  { id: 'channels', label: 'القنوات', icon: Radio, href: '/admin/channels' },
  { id: 'categories', label: 'التصنيفات', icon: Layers, href: '/admin/categories' },
  { id: 'banners', label: 'البانرات', icon: Image, href: '/admin/banners' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, href: '/admin/settings' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    // Fetch stats
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [moviesRes, seriesRes, channelsRes, categoriesRes, bannersRes] = await Promise.all([
        fetch('/api/admin/movies'),
        fetch('/api/admin/series'),
        fetch('/api/admin/channels'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/banners'),
      ]);
      
      const moviesData = await moviesRes.json();
      const seriesData = await seriesRes.json();
      const channelsData = await channelsRes.json();
      const categoriesData = await categoriesRes.json();
      const bannersData = await bannersRes.json();
      
      setStats({
        movies: moviesData.total || moviesData.length || 0,
        series: seriesData.total || seriesData.length || 0,
        channels: channelsData.length || 0,
        categories: categoriesData.length || 0,
        banners: bannersData.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-white/10">
        <h1 className="text-xl font-bold text-white">
          <span className="text-[#e50914]">Stream</span>Flix
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#141414] border-l border-white/10 transform transition-transform lg:transform-none',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}>
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-[#e50914]">Stream</span>Flix
            </h1>
            <p className="text-xs text-[#a3a3a3] mt-1">لوحة التحكم</p>
          </div>
          
          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'dashboard';
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right',
                    isActive
                      ? 'bg-[#e50914] text-white'
                      : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-[#a3a3a3]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#a3a3a3] hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
        
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">لوحة التحكم</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#e50914]/20 rounded-lg">
                  <Film className="w-5 h-5 text-[#e50914]" />
                </div>
                <span className="text-[#a3a3a3] text-sm">الأفلام</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.movies || 0}</p>
            </div>
            
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Tv className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-[#a3a3a3] text-sm">المسلسلات</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.series || 0}</p>
            </div>
            
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Radio className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-[#a3a3a3] text-sm">القنوات</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.channels || 0}</p>
            </div>
            
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Layers className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-[#a3a3a3] text-sm">التصنيفات</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.categories || 0}</p>
            </div>
            
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-[#a3a3a3] text-sm">البانرات</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.banners || 0}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push('/admin/movies')}
                  className="bg-[#e50914] hover:bg-[#f40612] text-white"
                >
                  <Film className="w-4 h-4 ml-2" />
                  إضافة فيلم
                </Button>
                <Button
                  onClick={() => router.push('/admin/series')}
                  className="bg-[#e50914] hover:bg-[#f40612] text-white"
                >
                  <Tv className="w-4 h-4 ml-2" />
                  إضافة مسلسل
                </Button>
                <Button
                  onClick={() => router.push('/admin/channels')}
                  className="bg-[#e50914] hover:bg-[#f40612] text-white"
                >
                  <Radio className="w-4 h-4 ml-2" />
                  إضافة قناة
                </Button>
                <Button
                  onClick={() => router.push('/admin/banners')}
                  className="bg-[#e50914] hover:bg-[#f40612] text-white"
                >
                  <ImageIcon className="w-4 h-4 ml-2" />
                  إضافة بانر
                </Button>
              </div>
            </div>
            
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">إحصائيات المشاهدات</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#e50914]" />
                    <span className="text-[#a3a3a3]">إجمالي المشاهدات</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-[#a3a3a3]">مشاهدات اليوم</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-[#a3a3a3]">المستخدمين النشطين</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
