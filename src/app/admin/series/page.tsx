'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Tv, Menu, X, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Episode {
  id: string;
  episodeNumber: number;
  title?: string | null;
  videoUrl?: string | null;
}

interface Season {
  id: string;
  seasonNumber: number;
  title?: string | null;
  episodes: Episode[];
}

interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  posterUrl?: string | null;
  year?: number | null;
  imdbRating?: number | null;
  status?: string | null;
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: { name: string } | null;
  categoryId?: string | null;
  seasons?: Season[];
  _count?: { seasons: number };
}

interface Category {
  id: string;
  name: string;
}

export default function AdminSeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    imdbRating: '',
    year: '',
    status: '',
    categoryId: '',
    isFeatured: false,
    isTrending: false,
  });

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
      const [seriesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/series'),
        fetch('/api/admin/categories'),
      ]);
      const seriesData = await seriesRes.json();
      const categoriesData = await categoriesRes.json();
      setSeries(seriesData.series || seriesData || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const openCreateDialog = () => {
    setEditingSeries(null);
    setFormData({
      title: '', slug: '', description: '', posterUrl: '', backdropUrl: '',
      imdbRating: '', year: '', status: '', categoryId: '',
      isFeatured: false, isTrending: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (s: Series) => {
    setEditingSeries(s);
    setFormData({
      title: s.title,
      slug: s.slug,
      description: s.description || '',
      posterUrl: s.posterUrl || '',
      backdropUrl: '',
      imdbRating: s.imdbRating?.toString() || '',
      year: s.year?.toString() || '',
      status: s.status || '',
      categoryId: s.categoryId || '',
      isFeatured: s.isFeatured || false,
      isTrending: s.isTrending || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSeries ? `/api/admin/series/${editingSeries.id}` : '/api/admin/series';
    const method = editingSeries ? 'PUT' : 'POST';
    
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
      console.error('Error saving series:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المسلسل؟')) return;
    try {
      await fetch(`/api/admin/series/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting series:', error);
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
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-white/10">
        <h1 className="text-xl font-bold text-white"><span className="text-[#e50914]">Stream</span>Flix</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        <aside className={cn(
          'fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#141414] border-l border-white/10 transform transition-transform lg:transform-none',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}>
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white"><span className="text-[#e50914]">Stream</span>Flix</h1>
          </div>
          <nav className="p-4 space-y-1">
            {[ 
              { id: 'dashboard', label: 'لوحة التحكم', href: '/admin' },
              { id: 'movies', label: 'الأفلام', href: '/admin/movies' },
              { id: 'series', label: 'المسلسلات', href: '/admin/series' },
              { id: 'channels', label: 'القنوات', href: '/admin/channels' },
              { id: 'categories', label: 'التصنيفات', href: '/admin/categories' },
              { id: 'banners', label: 'البانرات', href: '/admin/banners' },
              { id: 'settings', label: 'الإعدادات', href: '/admin/settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right',
                  item.id === 'series' ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                )}
              >
                <Tv className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#a3a3a3] hover:text-white">
              <LogOut className="w-5 h-5" /><span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>
        
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة المسلسلات</h2>
            <Button onClick={openCreateDialog} className="bg-[#e50914] hover:bg-[#f40612]">
              <Plus className="w-4 h-4 ml-2" />إضافة مسلسل
            </Button>
          </div>
          
          <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">المسلسل</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">السنة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">المواسم</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {series.map((s) => (
                    <>
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.posterUrl ? (
                              <img src={s.posterUrl} alt={s.title} className="w-10 h-14 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-14 bg-[#1a1a1a] rounded flex items-center justify-center">
                                <Tv className="w-4 h-4 text-white/20" />
                              </div>
                            )}
                            <span className="text-white font-medium">{s.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#a3a3a3]">{s.year || '-'}</td>
                        <td className="px-4 py-3 text-[#a3a3a3]">{s._count?.seasons || s.seasons?.length || 0}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded',
                            s.status === 'ongoing' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-[#a3a3a3]'
                          )}>
                            {s.status === 'ongoing' ? 'مستمر' : s.status === 'ended' ? 'مكتمل' : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {s.seasons && s.seasons.length > 0 && (
                              <button
                                onClick={() => setExpandedSeries(expandedSeries === s.id ? null : s.id)}
                                className="p-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 rounded"
                              >
                                {expandedSeries === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                            <button onClick={() => openEditDialog(s)} className="p-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 rounded">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedSeries === s.id && s.seasons && (
                        <tr key={`${s.id}-seasons`}>
                          <td colSpan={5} className="px-4 py-3 bg-[#0a0a0a]">
                            <div className="space-y-2">
                              {s.seasons.map((season) => (
                                <div key={season.id} className="bg-[#141414] rounded-lg p-3">
                                  <p className="text-white font-medium mb-2">
                                    {season.title || `الموسم ${season.seasonNumber}`} ({season.episodes?.length || 0} حلقات)
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {season.episodes?.map((ep) => (
                                      <span key={ep.id} className="px-2 py-1 bg-[#1a1a1a] rounded text-sm text-[#a3a3a3]">
                                        الحلقة {ep.episodeNumber}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            {series.length === 0 && <div className="p-8 text-center text-[#a3a3a3]">لا توجد مسلسلات حالياً</div>}
          </div>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{editingSeries ? 'تعديل المسلسل' : 'إضافة مسلسل جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">العنوان *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-white">الرابط (Slug)</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">الوصف</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">رابط الصورة</Label>
                <Input value={formData.posterUrl} onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">السنة</Label>
                <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="ongoing">مستمر</SelectItem>
                    <SelectItem value="ended">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">التصنيف</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.isFeatured} onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })} />
                <Label className="text-white">مميز</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.isTrending} onCheckedChange={(checked) => setFormData({ ...formData, isTrending: checked })} />
                <Label className="text-white">رائج</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white">إلغاء</Button>
              <Button type="submit" className="bg-[#e50914] hover:bg-[#f40612]">{editingSeries ? 'حفظ التغييرات' : 'إضافة المسلسل'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
