import type { PaymentItemDto } from '@/lib/types';

interface PaymentScheduleTableProps {
  items: PaymentItemDto[];
  totalAmount: number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700' },
  Paid: { label: 'Paid', className: 'bg-green-50 text-green-700' },
  Overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700' },
  Waived: { label: 'Waived', className: 'bg-gray-50 text-gray-700' },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PaymentScheduleTable({ items, totalAmount }: PaymentScheduleTableProps) {
  const paidCount = items.filter((i) => i.status === 'Paid').length;
  const paidAmount = items.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Paid {paidCount}/{items.length} installments</span>
          <span className="font-semibold text-gray-900">฿{paidAmount.toLocaleString('en-US')} / ฿{totalAmount.toLocaleString('en-US')}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(paidCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">Paid On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, className: 'bg-gray-50 text-gray-700' };
              return (
                <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">#{item.installmentNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ฿{item.amount.toLocaleString('en-US')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {item.paidAt ? formatDate(item.paidAt) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
