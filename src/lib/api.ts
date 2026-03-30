import { apiClient } from './apiClient';
import type {
  ApiProduct,
  CreatePaymentRequest,
  CreatePaymentResponse,
  TrackEventRequest,
  OrderStatus,
  EventSummary,
} from '../types/api';

export async function fetchProducts(): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<ApiProduct[]>('/products');
  return data;
}

export async function fetchProduct(id: string): Promise<ApiProduct> {
  const { data } = await apiClient.get<ApiProduct>(`/products/${id}`);
  return data;
}

export async function createPayment(
  req: CreatePaymentRequest,
): Promise<CreatePaymentResponse> {
  const { data } = await apiClient.post<CreatePaymentResponse>(
    '/payments/create',
    req,
  );
  return data;
}

export async function trackAnalyticsEvent(req: TrackEventRequest): Promise<void> {
  await apiClient.post('/analytics/event', req);
}

export async function fetchOrders(adminKey: string): Promise<OrderStatus[]> {
  const { data } = await apiClient.get<OrderStatus[]>('/payments/orders', {
    headers: { 'x-admin-key': adminKey },
  });
  return data;
}

export async function fetchAnalyticsSummary(
  adminKey: string,
  days = 30,
): Promise<EventSummary[]> {
  const { data } = await apiClient.get<EventSummary[]>('/analytics/summary', {
    headers: { 'x-admin-key': adminKey },
    params: { days },
  });
  return data;
}
