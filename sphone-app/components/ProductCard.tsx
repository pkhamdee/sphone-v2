import Link from 'next/link';
import type { ProductDto } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/types';

interface ProductCardProps {
  product: ProductDto;
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const categoryIcon = CATEGORY_ICONS[product.category] ?? '📦';
  const minInstallment = Math.ceil(product.price * 1.18 / 24); // 24-month estimate

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Product Image Placeholder */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-48 flex items-center justify-center text-6xl">
        {categoryIcon}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category Badge */}
        <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">
          {categoryLabel}
        </span>

        {/* Name & Brand */}
        <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 flex-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-bold text-gray-900">
            ฿{product.price.toLocaleString('en-US')}
          </p>
          <p className="text-xs text-blue-600 font-medium">
            From ฿{minInstallment.toLocaleString('en-US')}/mo.
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/apply/${product.id}`}
          className="block text-center text-sm font-medium py-2.5 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Get Installment
        </Link>
      </div>
    </div>
  );
}
