'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nationalId: '',
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      router.push('/login?registered=1');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Just your national ID — nothing else needed</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National ID (13 digits)</label>
              <input
                type="text"
                maxLength={13}
                placeholder="1234567890123"
                value={form.nationalId}
                onChange={set('nationalId')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Smith"
                value={form.fullName}
                onChange={set('fullName')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="0812345678"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={set('dateOfBirth')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                required
              />
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              ✅ No salary slip &nbsp;·&nbsp; ✅ No guarantor &nbsp;·&nbsp; ✅ Fast approval
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
