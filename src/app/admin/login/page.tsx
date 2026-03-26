'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      router.push('/admin');
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#141414] border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            <span className="text-[#e50914]">Stream</span>Flix Admin
          </CardTitle>
          <p className="text-[#a3a3a3]">تسجيل الدخول للوحة التحكم</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@streamflix.com"
                required
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e50914] hover:bg-[#f40612] text-white"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-[#a3a3a3]">
            <p>بيانات الدخول الافتراضية:</p>
            <p>البريد: admin@streamflix.com</p>
            <p>كلمة المرور: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
