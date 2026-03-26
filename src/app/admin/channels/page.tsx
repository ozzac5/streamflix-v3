'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Radio, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  streamUrl?: string | null;
  country?: string | null;
  isLive?: boolean;
  category?: { name: string } | null;
  categoryId?: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', logoUrl: '', streamUrl: '', country: '', categoryId: '', isLive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [channelsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/channels'),
        fetch('/api/admin/categories'),
      ]);
      setChannels(await channelsRes.json());
      setCategories(await categoriesRes.json());
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
    setEditingChannel(null);
    setFormData({ name: '', slug: '', logoUrl: '', streamUrl: '', country: '', categoryId: '', isLive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (c: Channel) => {
    setEditingChannel(c);
    setFormData({
      name: c.name, slug: c.slug, logoUrl: c.logoUrl || '', streamUrl: c.streamUrl || '',
      country: c.country || '', categoryId: c.categoryId || '', isLive: c.isLive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingChannel ? `/api/admin/channels/${editingChannel.id}` : '/api/admin/channels';
    const method = editingChannel ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-') }),
      });
      if (res.ok) { setDialogOpen(false); fetchData(); }
    } catch (error) { console.error('Error saving channel:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه القناة؟')) return;
    try { await fetch(`/api/admin/channels/${id}`, { method: 'DELETE' }); fetchData(); }
    catch (error) { console.error('Error deleting channel:', error); }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-white/10">
        <h1 className="text-xl font-bold text-white"><span className="text-[#e50914]">Stream</span>Flix</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white">{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      <div className="flex">
        <aside className={cn('fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#141414] border-l border-white/10 transform transition-transform lg:transform-none', sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')}>
          <div className="p-6 border-b border-white/10"><h1 className="text-2xl font-bold text-white"><span className="text-[#e50914]">Stream</span>Flix</h1></div>
          <nav className="p-4 space-y-1">
            {[{ id: 'dashboard', label: 'لوحة التحكم', href: '/admin' }, { id: 'movies', label: 'الأفلام', href: '/admin/movies' }, { id: 'series', label: 'المسلسلات', href: '/admin/series' }, { id: 'channels', label: 'القنوات', href: '/admin/channels' }, { id: 'categories', label: 'التصنيفات', href: '/admin/categories' }, { id: 'banners', label: 'البانرات', href: '/admin/banners' }, { id: 'settings', label: 'الإعدادات', href: '/admin/settings' }].map((item) => (
              <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right', item.id === 'channels' ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5')}>
                <Radio className="w-5 h-5" /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#a3a3a3] hover:text-white"><LogOut className="w-5 h-5" /><span>تسجيل الخروج</span></button>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة القنوات</h2>
            <Button onClick={openCreateDialog} className="bg-[#e50914] hover:bg-[#f40612]"><Plus className="w-4 h-4 ml-2" />إضافة قناة</Button>
          </div>
          <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">القناة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">البلد</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">التصنيف</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {channels.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-10 h-10 object-contain rounded" /> : <div className="w-10 h-10 bg-[#1a1a1a] rounded flex items-center justify-center"><Radio className="w-4 h-4 text-white/20" /></div>}
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{c.country || '-'}</td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{c.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 text-xs rounded', c.isLive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}>
                          {c.isLive ? 'بث مباشر' : 'متوقف'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditDialog(c)} className="p-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 rounded"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {channels.length === 0 && <div className="p-8 text-center text-[#a3a3a3]">لا توجد قنوات حالياً</div>}
          </div>
        </main>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-[#141414] border-white/10">
          <DialogHeader><DialogTitle className="text-white">{editingChannel ? 'تعديل القناة' : 'إضافة قناة جديدة'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-white">الاسم *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" required /></div>
              <div className="space-y-2"><Label className="text-white">الرابط (Slug)</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            </div>
            <div className="space-y-2"><Label className="text-white">رابط اللوجو</Label><Input value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">رابط البث</Label><Input value={formData.streamUrl} onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="m3u8 link" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-white">البلد</Label><Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-white">التصنيف</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formData.isLive} onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked })} /><Label className="text-white">بث مباشر</Label></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white">إلغاء</Button>
              <Button type="submit" className="bg-[#e50914] hover:bg-[#f40612]">{editingChannel ? 'حفظ التغييرات' : 'إضافة القناة'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
