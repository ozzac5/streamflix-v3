'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Layers, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  _count?: { movies: number; series: number; channels: number };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try { setCategories(await (await fetch('/api/admin/categories')).json()); }
    catch (error) { console.error('Error fetching categories:', error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/admin/login'); };

  const openCreateDialog = () => { setEditingCategory(null); setFormData({ name: '', slug: '', icon: '' }); setDialogOpen(true); };
  const openEditDialog = (c: Category) => { setEditingCategory(c); setFormData({ name: c.name, slug: c.slug, icon: c.icon || '' }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-') }),
      });
      if (res.ok) { setDialogOpen(false); fetchData(); }
    } catch (error) { console.error('Error saving category:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try { await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); fetchData(); }
    catch (error) { console.error('Error deleting category:', error); }
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
              <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right', item.id === 'categories' ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5')}>
                <Layers className="w-5 h-5" /><span>{item.label}</span>
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
            <h2 className="text-2xl font-bold text-white">إدارة التصنيفات</h2>
            <Button onClick={openCreateDialog} className="bg-[#e50914] hover:bg-[#f40612]"><Plus className="w-4 h-4 ml-2" />إضافة تصنيف</Button>
          </div>
          <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">التصنيف</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الأفلام</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">المسلسلات</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">القنوات</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#a3a3a3]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-[#a3a3a3]">{c._count?.movies || 0}</td>
                    <td className="px-4 py-3 text-[#a3a3a3]">{c._count?.series || 0}</td>
                    <td className="px-4 py-3 text-[#a3a3a3]">{c._count?.channels || 0}</td>
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
            {categories.length === 0 && <div className="p-8 text-center text-[#a3a3a3]">لا توجد تصنيفات حالياً</div>}
          </div>
        </main>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[#141414] border-white/10">
          <DialogHeader><DialogTitle className="text-white">{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label className="text-white">الاسم *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" required /></div>
            <div className="space-y-2"><Label className="text-white">الرابط (Slug)</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white">إلغاء</Button>
              <Button type="submit" className="bg-[#e50914] hover:bg-[#f40612]">{editingCategory ? 'حفظ التغييرات' : 'إضافة التصنيف'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
