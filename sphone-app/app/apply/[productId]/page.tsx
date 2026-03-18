'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { productApi, orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import InstallmentCalculator from '@/components/InstallmentCalculator';
import Link from 'next/link';

export default function ApplyPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getById(productId).then((r) => r.data),
  });

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: (payload: { productId: string; downPayment: number; totalMonths: number }) =>
      orderApi.create(payload),
    onSuccess: () => router.push('/dashboard'),
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { error?: string } } })?.response?.data;
      setError(data?.error ?? 'Unable to create installment request.');
    },
  });

  const handleSelect = (downPayment: number, totalMonths: number) => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setError('');
    createOrder({ productId, downPayment, totalMonths });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        Product not found.{' '}
        <Link href="/products" className="text-blue-600 underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/products" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to products
      </Link>

      {/* Product Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
            📱
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{product.brand}</p>
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">{product.name}</h2>
            <p className="text-2xl font-bold text-blue-600">
              ฿{product.price.toLocaleString('en-US')}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">{product.description}</p>
      </div>

      {/* Calculator */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <InstallmentCalculator
        price={product.price}
        onSelect={handleSelect}
      />

      {isPending && (
        <div className="mt-4 text-center text-sm text-gray-500">Submitting request...</div>
      )}

      {!isAuthenticated() && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Please{' '}
          <Link href="/login" className="text-blue-600 underline">sign in</Link>
          {' '}before making an installment purchase.
        </p>
      )}
    </div>
  );
}
