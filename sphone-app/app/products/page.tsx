'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api';
import { CATEGORY_LABELS, type ProductCategory } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';

const ALL_CATEGORIES: [string, string][] = [
  ['', 'All'],
  ...Object.entries(CATEGORY_LABELS),
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') ?? '';

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => productApi.getAll(category || undefined).then((r) => r.data),
  });

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {ALL_CATEGORIES.map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => router.push(cat ? `/products?category=${cat}` : '/products')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500">
          Unable to load products. Please try again.
        </div>
      )}

      {products && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">No products found in this category.</div>
      )}

      {products && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">All Products</h1>
      <p className="text-gray-500 mb-6">Installments available on everything — starting at ฿500/month</p>
      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
