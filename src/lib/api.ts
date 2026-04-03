import { apiClient } from './apiClient';
import type {
  ApiProduct,
  CreatePaymentRequest,
  CreatePaymentResponse,
  UpdateProductRequest,
  TrackEventRequest,
  OrderStatus,
  EventSummary,
  CreateSessionRequest,
  CreateSessionResponse,
} from '../types/api';

export async function fetchProducts(): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<ApiProduct[]>('/products');
  return Array.isArray(data) ? data : [];
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

export async function updateProduct(
  id: string,
  adminKey: string,
  data: UpdateProductRequest,
): Promise<ApiProduct> {
  const { data: product } = await apiClient.patch<ApiProduct>(`/products/${id}`, data, {
    headers: { 'x-admin-key': adminKey },
  });
  return product;
}

export async function deleteProduct(id: string, adminKey: string): Promise<void> {
  await apiClient.delete(`/products/${id}`, {
    headers: { 'x-admin-key': adminKey },
  });
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

export async function createSession(
  email: string,
): Promise<CreateSessionResponse> {
  const req: CreateSessionRequest = { email };
  const { data } = await apiClient.post<{
    session_token: string;
    expires_at: string;
    product_ids: string[];
  }>('/auth/session', req);
  return {
    sessionToken: data.session_token,
    expiresAt: data.expires_at,
    productIds: data.product_ids,
  };
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
