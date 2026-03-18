'use client';

import { useState } from 'react';

interface InstallmentCalculatorProps {
  price: number;
  onSelect?: (downPayment: number, months: number) => void;
}

const MONTH_OPTIONS = [3, 6, 12, 18, 24];
const INTEREST_RATE = 0.18; // 18% annual

function calculateMonthly(price: number, downPayment: number, months: number): number {
  const principal = price - downPayment;
  if (principal <= 0) return 0;
  const monthlyRate = INTEREST_RATE / 12;
  return Math.ceil(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

export default function InstallmentCalculator({ price, onSelect }: InstallmentCalculatorProps) {
  const [downPayment, setDownPayment] = useState(0);
  const [months, setMonths] = useState(12);

  const monthly = calculateMonthly(price, downPayment, months);
  const total = downPayment + monthly * months;
  const interest = total - price;

  return (
    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Installment Calculator</h3>

      {/* Down Payment */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Down Payment</span>
          <span className="font-semibold text-gray-900">฿{downPayment.toLocaleString('en-US')}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.floor(price * 0.5)}
          step={500}
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>฿0</span>
          <span>฿{Math.floor(price * 0.5).toLocaleString('en-US')}</span>
        </div>
      </div>

      {/* Months */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Term (months)</p>
        <div className="grid grid-cols-5 gap-2">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                months === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">months</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Monthly Payment</span>
          <span className="text-2xl font-bold text-blue-600">฿{monthly.toLocaleString('en-US')}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Amount</span>
          <span>฿{total.toLocaleString('en-US')}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Interest (18% p.a.)</span>
          <span>฿{interest.toLocaleString('en-US')}</span>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(downPayment, months)}
          disabled={monthly < 500}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {monthly < 500 ? 'Min. monthly payment is ฿500' : 'Confirm Installment Plan'}
        </button>
      )}
    </div>
  );
}
