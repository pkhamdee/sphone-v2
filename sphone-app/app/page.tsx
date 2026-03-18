import Link from 'next/link';
import { CATEGORY_LABELS, CATEGORY_ICONS, type ProductCategory } from '@/lib/types';

const categories = (Object.entries(CATEGORY_LABELS) as [string, string][]).map(
  ([k, v]) => [Number(k) as ProductCategory, v] as [ProductCategory, string]
);

const HOW_IT_WORKS = [
  { step: '1', title: 'Choose a Product', desc: 'Browse products across all categories' },
  { step: '2', title: 'Enter Your Info', desc: 'Just your national ID — no extra documents needed' },
  { step: '3', title: 'Pick a Plan', desc: 'Installments from 3–24 months, starting at ฿500/month' },
  { step: '4', title: 'Get Your Product', desc: 'Fast approval — receive your product right away' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm font-medium mb-6">
            ✨ Easy installments — no guarantor required
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Get the products you love<br />
            <span className="text-yellow-300">Starting from just ฿500/month</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Phones, tablets, appliances, furniture, and electric motorcycles.
            National ID only — no salary slip required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/products"
              className="px-8 py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              Browse All Products
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '฿500', label: 'Min. monthly payment' },
            { value: '24 mo.', label: 'Max. term' },
            { value: '1 doc', label: 'National ID only' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Shop by Category</h2>
        <p className="text-gray-500 text-center mb-10">Wide selection of products to suit every need</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map(([cat, label]) => (
            <Link
              key={cat}
              href={`/products?category=${cat}`}
              className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat]}
              </span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">How It Works</h2>
          <p className="text-gray-500 text-center mb-10">Simple and fast — just 4 steps</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-6">Free to sign up — no fees</p>
        <Link
          href="/register"
          className="inline-block px-10 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          Sign Up for Free
        </Link>
      </section>
    </div>
  );
}
