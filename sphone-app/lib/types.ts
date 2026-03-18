// API Response Types

export interface RegisterCustomerResult {
  customerId: string;
  fullName: string;
}

export interface LoginCustomerResult {
  token: string;
  customerId: string;
  fullName: string;
}

export interface CustomerProfileDto {
  id: string;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  creditLimit: number;
  status: string;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  brand: string;
  imageUrl: string;
  price: number;
  currency: string;
  category: ProductCategory;
  isAvailable: boolean;
}

export interface CreateOrderResult {
  orderId: string;
  monthlyAmount: number;
  totalAmount: number;
  totalMonths: number;
}

export interface OrderSummaryDto {
  orderId: string;
  productName: string;
  monthlyAmount: number;
  totalAmount: number;
  totalMonths: number;
  status: string;
  createdAt: string;
}

export interface PaymentItemDto {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

export interface PaymentScheduleDto {
  scheduleId: string;
  orderId: string;
  totalAmount: number;
  totalMonths: number;
  items: PaymentItemDto[];
}

export type ProductCategory = 1 | 2 | 3 | 4 | 5;

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  1: 'Mobile Phones',
  2: 'Tablets',
  3: 'Appliances',
  4: 'Furniture',
  5: 'Electric Motorcycles',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  1: '📱',
  2: '⬛',
  3: '🏠',
  4: '🪑',
  5: '⚡',
};
