'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ImageIcon, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', imageUrl: '', isActive: true, order: 0 });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try { setBanners(await (await fetch('/api/admin/banners')).json()); }
    catch (error) { console.error('Error fetching banners:', error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/admin/login'); };
  const openCreateDialog = () => { setEditingBanner(null); setFormData({ title: '', subtitle: '', imageUrl: '', isActive: true, order: 0 }); setDialogOpen(true); };
  const openEditDialog = (b: Banner) => { setEditingBanner(b); setFormData({ title: b.title, subtitle: b.subtitle || '', imageUrl: b.imageUrl, isActive: b.isActive, order: b.order }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';
    const method = editingBanner ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setDialogOpen(false); fetchData(); }
    } catch (error) { console.error('Error saving banner:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;
    try { await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' }); fetchData(); }
    catch (error) { console.error('Error deleting banner:', error); }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" /></div>;

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
              <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right', item.id === 'banners' ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5')}>
                <ImageIcon className="w-5 h-5" /><span>{item.label}</span>
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
            <h2 className="text-2xl font-bold text-white">إدارة البانرات</h2>
            <Button onClick={openCreateDialog} className="bg-[#e50914] hover:bg-[#f40612]"><Plus className="w-4 h-4 ml-2" />إضافة بانر</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
                <div className="aspect-[3/1] relative">
                  {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center"><ImageIcon className="w-8 h-8 text-white/20" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold">{b.title}</h3>
                    {b.subtitle && <p className="text-sm text-[#a3a3a3]">{b.subtitle}</p>}
                  </div>
                  <div className="absolute top-2 left-2 flex gap-2">
                    {!b.isActive && <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">غير نشط</span>}
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm text-[#a3a3a3]">الترتيب: {b.order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditDialog(b)} className="p-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {banners.length === 0 && <div className="p-8 text-center text-[#a3a3a3]">لا توجد بانرات حالياً</div>}
        </main>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[#141414] border-white/10">
          <DialogHeader><DialogTitle className="text-white">{editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label className="text-white">العنوان *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" required /></div>
            <div className="space-y-2"><Label className="text-white">العنوان الفرعي</Label><Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-white">رابط الصورة *</Label><Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" required /></div>
            <div className="space-y-2"><Label className="text-white">الترتيب</Label><Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            <div className="flex items-center gap-2"><Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} /><Label className="text-white">نشط</Label></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white">إلغاء</Button>
              <Button type="submit" className="bg-[#e50914] hover:bg-[#f40612]">{editingBanner ? 'حفظ التغييرات' : 'إضافة البانر'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
