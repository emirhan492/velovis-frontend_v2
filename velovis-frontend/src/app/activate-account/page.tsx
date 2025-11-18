'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// Artık 'api.ts' düzeldiği için onu GÜVENLE import edebiliriz
import  api  from '../lib/api'; 
import Link from 'next/link';

// Bu iç bileşen, Suspense içinde çalışarak token'ı okur ve API isteğini atar
function ActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const activateAccount = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
          // Düzelttiğimiz 'api' değişkenini kullanıyoruz
          const response = await api.get(`/auth/activate?token=${token}`);

          setSuccess(
            response.data.message || 'Hesap başarıyla aktifleştirildi!',
          );
          setIsLoading(false);

          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } catch (err: any) {
          console.error(err);
          if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(
              'Aktivasyon sırasında bir hata oluştu veya link geçersiz.',
            );
          }
          setIsLoading(false);
        }
      };

      activateAccount();
    } else {
      setError("Aktivasyon token'ı bulunamadı.");
      setIsLoading(false);
    }
  }, [token, router]);

  // --- Arayüz ---
  if (isLoading) {
    return (
      <p className="text-center text-lg text-gray-700">
        Hesabınız aktifleştiriliyor, lütfen bekleyin...
      </p>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-lg text-red-600">{error}</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-4 block">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <p className="text-lg text-green-600">{success}</p>
        <p className="text-gray-600">Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return null;
}

// Ana Sayfa Bileşeni
export default function ActivateAccountPage() {
  return (
    <div className="container mx-auto max-w-md p-8 mt-20 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Hesap Aktivasyonu</h1>
      <Suspense
        fallback={
          <p className="text-center text-gray-500">Yükleniyor...</p>
        }
      >
        <ActivationContent />
      </Suspense>
    </div>
  );
}