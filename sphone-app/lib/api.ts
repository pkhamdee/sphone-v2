import axios from 'axios';
import type {
  CustomerProfileDto,
  LoginCustomerResult,
  OrderSummaryDto,
  PaymentScheduleDto,
  ProductDto,
  RegisterCustomerResult,
  CreateOrderResult,
} from './types';

// Route through the Next.js server proxy so the Node.js runtime makes the
// outbound HTTP call — this creates the sphone-app → sphone-api traced edge.
const api = axios.create({
  baseURL: typeof window !== 'undefined'
    ? '/api/proxy'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5154/api'),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sphone_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: {
    nationalId: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
  }) => api.post<RegisterCustomerResult>('/auth/register', data),

  login: (data: { nationalId: string; phoneNumber: string }) =>
    api.post<LoginCustomerResult>('/auth/login', data),
};

// Customers
export const customerApi = {
  getMe: () => api.get<CustomerProfileDto>('/customers/me'),
};

// Products
export const productApi = {
  getAll: (category?: string) =>
    api.get<ProductDto[]>('/products', { params: category ? { category } : {} }),
  getById: (id: string) => api.get<ProductDto>(`/products/${id}`),
};

// Orders
export const orderApi = {
  create: (data: { productId: string; downPayment: number; totalMonths: number }) =>
    api.post<CreateOrderResult>('/orders', data),
  getMyOrders: () => api.get<OrderSummaryDto[]>('/orders/my'),
};

// Payments
export const paymentApi = {
  getSchedule: (orderId: string) =>
    api.get<PaymentScheduleDto>(`/payments/schedule/${orderId}`),
};

export default api;
