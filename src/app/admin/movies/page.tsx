'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Film, Menu, X, LogOut, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Movie {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  posterUrl?: string | null;
  videoUrl?: string | null;
  year?: number | null;
  duration?: number | null;
  imdbRating?: number | null;
  quality?: string | null;
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: { name: string } | null;
  categoryId?: string | null;
}

interface Category {
  id: string;
  name: string;
}

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: Film, href: '/admin' },
  { id: 'movies', label: 'الأفلام', icon: Film, href: '/admin/movies' },
  { id: 'series', label: 'المسلسلات', icon: Film, href: '/admin/series' },
  { id: 'channels', label: 'القنوات', icon: Film, href: '/admin/channels' },
  { id: 'categories', label: 'التصنيفات', icon: Film, href: '/admin/categories' },
  { id: 'banners', label: 'البانرات', icon: Film, href: '/admin/banners' },
  { id: 'settings', label: 'الإعدادات', icon: Film, href: '/admin/settings' },
];

export default function AdminMoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '',
    trailerUrl: '',
    imdbRating: '',
    year: '',
    duration: '',
    quality: '',
    language: '',
    country: '',
    categoryId: '',
    isFeatured: false,
    isTrending: false,
  });
  
  // IMDB Search state
  const [imdbSearchQuery, setImdbSearchQuery] = useState('');
  const [imdbResults, setImdbResults] = useState<any[]>([]);
  const [isSearchingImdb, setIsSearchingImdb] = useState(false);
  const [showImdbResults, setShowImdbResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [moviesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/movies'),
        fetch('/api/admin/categories'),
      ]);
      
      const moviesData = await moviesRes.json();
      const categoriesData = await categoriesRes.json();
      
      setMovies(moviesData.movies || moviesData || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const openCreateDialog = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      videoUrl: '',
      trailerUrl: '',
      imdbRating: '',
      year: '',
      duration: '',
      quality: '',
      language: '',
      country: '',
      categoryId: '',
      isFeatured: false,
      isTrending: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      slug: movie.slug,
      description: movie.description || '',
      posterUrl: movie.posterUrl || '',
      backdropUrl: '',
      videoUrl: movie.videoUrl || '',
      trailerUrl: '',
      imdbRating: movie.imdbRating?.toString() || '',
      year: movie.year?.toString() || '',
      duration: movie.duration?.toString() || '',
      quality: movie.quality || '',
      language: '',
      country: '',
      categoryId: movie.categoryId || '',
      isFeatured: movie.isFeatured || false,
      isTrending: movie.isTrending || false,
    });
    setDialogOpen(true);
  };

  // IMDB Search function
  const searchImdb = async () => {
    if (!imdbSearchQuery.trim()) return;
    
    setIsSearchingImdb(true);
    setShowImdbResults(true);
    
    try {
      const res = await fetch(`/api/imdb?action=search&query=${encodeURIComponent(imdbSearchQuery)}`);
      const data = await res.json();
      
      if (data.results) {
        setImdbResults(data.results.filter((r: any) => r.type === 'Movie' || r.type === 'Series' || r.resultType === 'Title'));
      } else if (data.errorMessage) {
        console.error('IMDB API Error:', data.errorMessage);
      }
    } catch (error) {
      console.error('Error searching IMDB:', error);
    } finally {
      setIsSearchingImdb(false);
    }
  };
  
  // Fetch IMDB title details and fill form
  const selectImdbResult = async (imdbId: string) => {
    try {
      const res = await fetch(`/api/imdb?action=title&id=${imdbId}`);
      const data = await res.json();
      
      if (data) {
        setFormData({
          ...formData,
          title: data.title || '',
          slug: data.title ? data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '',
          description: data.plot || data.plotLocal || '',
          posterUrl: data.image || '',
          backdropUrl: '',
          videoUrl: '',
          trailerUrl: data.trailer?.link || '',
          imdbRating: data.imDbRating || '',
          year: data.year ? data.year.split('–')[0] : '',
          duration: data.runtimeMins || '',
          quality: 'HD',
          language: data.languageList?.[0]?.value || '',
          country: data.countryList?.[0]?.value || '',
          categoryId: formData.categoryId,
          isFeatured: false,
          isTrending: false,
        });
        setShowImdbResults(false);
      }
    } catch (error) {
      console.error('Error fetching IMDB details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingMovie 
      ? `/api/admin/movies/${editingMovie.id}`
      : '/api/admin/movies';
    
    const method = editingMovie ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      
      if (res.ok) {
        setDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيلم؟')) return;
    
    try {
      await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#141414] border-l border-white/10 transform transition-transform lg:transform-none',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}>
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-[#e50914]">Stream</span>Flix
            </h1>
          </div>
          
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'movies';
              return (
                <button
                  key={item.id}
                  onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right',
                    isActive ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#a3a3a3] hover:text-white">
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>
        
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الأفلام</h2>
            <Button onClick={openCreateDialog} className="bg-[#e50914] hover:bg-[#f40612]">
              <Plus className="w-4 h-4 ml-2" />
              إضافة فيلم
            </Button>
          </div>
          
          {/* Movies Table */}
          <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">العنوان</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">السنة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">التقييم</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">التصنيف</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-14 bg-[#1a1a1a] rounded flex items-center justify-center">
                              <Film className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                          <span className="text-white font-medium">{movie.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{movie.year || '-'}</td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{movie.imdbRating || '-'}</td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{movie.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {movie.isFeatured && (
                            <span className="px-2 py-0.5 bg-[#e50914]/20 text-[#e50914] text-xs rounded">مميز</span>
                          )}
                          {movie.isTrending && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded">رائج</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditDialog(movie)}
                            className="p-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(movie.id)}
                            className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {movies.length === 0 && (
              <div className="p-8 text-center text-[#a3a3a3]">
                لا توجد أفلام حالياً
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingMovie ? 'تعديل الفيلم' : 'إضافة فيلم جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* IMDB Search */}
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
              <Label className="text-white mb-2 block">البحث في IMDB</Label>
              <div className="flex gap-2">
                <Input
                  value={imdbSearchQuery}
                  onChange={(e) => setImdbSearchQuery(e.target.value)}
                  placeholder="ابحث عن فيلم..."
                  className="bg-[#0a0a0a] border-white/10 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchImdb())}
                />
                <Button
                  type="button"
                  onClick={searchImdb}
                  disabled={isSearchingImdb}
                  className="bg-[#e50914] hover:bg-[#f40612]"
                >
                  {isSearchingImdb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* IMDB Results */}
              {showImdbResults && imdbResults.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                  {imdbResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => selectImdbResult(result.id)}
                      className="w-full flex items-center gap-3 p-2 bg-[#0a0a0a] hover:bg-[#e50914]/20 rounded-lg transition-colors text-right"
                    >
                      {result.image && (
                        <img src={result.image} alt={result.title} className="w-12 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{result.title}</p>
                        <p className="text-[#a3a3a3] text-xs">{result.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">العنوان *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">الرابط (Slug)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#1a1a1a] border-white/10 text-white"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">رابط الصورة</Label>
                <Input
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">رابط الفيديو</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">السنة</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">المدة (دقيقة)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">التقييم</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.imdbRating}
                  onChange={(e) => setFormData({ ...formData, imdbRating: e.target.value })}
                  className="bg-[#1a1a1a] border-white/10 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">الجودة</Label>
                <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectValue placeholder="اختر الجودة" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="HD">HD</SelectItem>
                    <SelectItem value="Full HD">Full HD</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">التصنيف</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label className="text-white">مميز</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isTrending}
                  onCheckedChange={(checked) => setFormData({ ...formData, isTrending: checked })}
                />
                <Label className="text-white">رائج</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white">
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#e50914] hover:bg-[#f40612]">
                {editingMovie ? 'حفظ التغييرات' : 'إضافة الفيلم'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
