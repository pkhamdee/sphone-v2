'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { orderApi, paymentApi } from '@/lib/api';
import PaymentScheduleTable from '@/components/PaymentScheduleTable';
import type { PaymentScheduleDto } from '@/lib/types';

const ORDER_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700' },
  Approved: { label: 'Approved', className: 'bg-blue-50 text-blue-700' },
  Active: { label: 'Active', className: 'bg-green-50 text-green-700' },
  Completed: { label: 'Completed', className: 'bg-gray-50 text-gray-600' },
  Rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { customer, isAuthenticated } = useAuthStore();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Record<string, PaymentScheduleDto>>({});

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const toggleSchedule = async (orderId: string) => {
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
      return;
    }
    setActiveOrderId(orderId);
    if (!schedules[orderId]) {
      const { data } = await paymentApi.getSchedule(orderId);
      setSchedules((s) => ({ ...s, [orderId]: data }));
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
        <p className="text-sm text-blue-200 mb-1">Hello,</p>
        <h1 className="text-2xl font-bold mb-3">{customer?.fullName}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-blue-200">Credit Limit</p>
            <p className="text-xl font-bold">฿{customer?.creditLimit?.toLocaleString('en-US')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-blue-200">Status</p>
            <p className="text-xl font-bold capitalize">{customer?.status}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Installments</h2>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {orders?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 mb-4">No installments yet</p>
          <a href="/products" className="text-sm px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium">
            Browse products
          </a>
        </div>
      )}

      <div className="space-y-4">
        {orders?.map((order) => {
          const cfg = ORDER_STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-50 text-gray-700' };
          const schedule = schedules[order.orderId];

          return (
            <div key={order.orderId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{order.productName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Monthly</p>
                    <p className="font-bold text-blue-600">฿{order.monthlyAmount.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Term</p>
                    <p className="font-semibold text-gray-900">{order.totalMonths} mo.</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900">฿{order.totalAmount.toLocaleString('en-US')}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleSchedule(order.orderId)}
                  className="mt-3 text-sm text-blue-600 font-medium hover:underline"
                >
                  {activeOrderId === order.orderId ? 'Hide schedule ↑' : 'View schedule ↓'}
                </button>
              </div>

              {activeOrderId === order.orderId && schedule && (
                <div className="border-t border-gray-50 p-5">
                  <PaymentScheduleTable items={schedule.items} totalAmount={schedule.totalAmount} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
