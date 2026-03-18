'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function Navbar() {
  const { customer, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SP
            </div>
            <span className="font-bold text-xl text-gray-900">sPhone</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Products
            </Link>
            {isAuthenticated() && (
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, {customer?.fullName?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
