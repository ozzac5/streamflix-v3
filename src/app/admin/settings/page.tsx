'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Menu, X, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try { setSettings(await (await fetch('/api/admin/settings')).json()); }
    catch (error) { console.error('Error fetching settings:', error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/admin/login'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) { console.error('Error saving settings:', error); }
    finally { setIsSaving(false); }
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
              <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right', item.id === 'settings' ? 'bg-[#e50914] text-white' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5')}>
                <Settings className="w-5 h-5" /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#a3a3a3] hover:text-white"><LogOut className="w-5 h-5" /><span>تسجيل الخروج</span></button>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">إعدادات التطبيق</h2>
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">إعدادات عامة</h3>
              <div className="space-y-2">
                <Label className="text-white">اسم الموقع</Label>
                <Input value={settings.site_name || ''} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">وصف الموقع</Label>
                <Input value={settings.site_description || ''} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">البريد الإلكتروني للتواصل</Label>
                <Input value={settings.contact_email || ''} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" type="email" />
              </div>
            </div>
            <Button type="submit" disabled={isSaving} className="bg-[#e50914] hover:bg-[#f40612]">
              <Save className="w-4 h-4 ml-2" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
