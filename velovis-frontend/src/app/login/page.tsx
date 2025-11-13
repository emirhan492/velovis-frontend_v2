// Dosya: src/app/login/page.tsx

"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';
import { useAuthStore } from '../lib/store/auth.store';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

// =================================================================
// === 1. DOĞRU YAPI: Suspense Wrapper (Dışarıda) ===
// Sadece bu fonksiyon 'export default' olmalı.
// =================================================================
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center text-yellow-400">Yükleniyor...</div>}>
      <LoginPage />
    </Suspense>
  );
}

// =================================================================
// === 2. HATA DÜZELTMESİ: Ana Component (İçeride) ===
// Buradaki 'export default' kaldırıldı.
// =================================================================
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktivasyon linkinden gelindiyse mesaj göster
  useEffect(() => {
    const activated = searchParams.get('activated');
    const errorParam = searchParams.get('error');

    if (activated === 'true') {
      setActivationSuccess('Hesabınız başarıyla aktifleştirildi. Şimdi giriş yapabilirsiniz.');
      router.replace('/login', { scroll: false });
    } else if (errorParam === 'activation_failed') {
      setError('Hesap aktivasyonu başarısız oldu. Link geçersiz veya süresi dolmuş olabilir.');
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Form gönderilince aktivasyon mesajını temizle
    if (activationSuccess) setActivationSuccess(null);

    try {
      const { data: tokens } = await api.post('/auth/login', {
        username,
        password,
      });
      const { data: user } = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      login(tokens, user);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      // Backend'den gelen 'isActive: false' hatasını yakala
      const message = err.response?.data?.message || "Kullanıcı adı veya parola hatalı. Lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-sm p-4">
      <h1 className="text-3xl font-bold text-center text-blue-400">Giriş Yap</h1>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        
        {/* Aktivasyon Başarı mesajı alanı */}
        {activationSuccess && (
          <div className="rounded-md bg-green-800 p-3 text-center text-green-100">
            {activationSuccess}
          </div>
        )}

        {/* Hata mesajı alanı */}
        {error && (
          <div className="rounded-md bg-red-800 p-3 text-center text-red-100">
            {error}
          </div>
        )}

        {/* Kullanıcı Adı */}
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-300"
          >
            Kullanıcı Adı
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Parola Alanı (Göz ikonuyla) */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-300"
          >
            Parola
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-md border-gray-700 bg-gray-800 p-2 pr-10 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Giriş Yap Butonu */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </div>

        {/* Şifremi Unuttum Linki */}
        <div className="text-center">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>

      </form>
    </main>
  );
}