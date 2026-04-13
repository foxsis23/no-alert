export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export interface ApiProduct {
  id: string;
  siteId: string;
  title: string;
  description: string;
  price: string;
  videoUrls: string[] | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface CreatePaymentRequest {
  productId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

export interface WayForPayFormData {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: string;
  currency: string;
  productName: string[];
  productPrice: string[];
  productCount: number[];
  merchantSignature: string;
  apiVersion: number;
  language: string;
}

export interface CreatePaymentResponse {
  orderId: string;
  formData: WayForPayFormData;
}

export interface TrackEventRequest {
  event: string;
  metadata?: Record<string, unknown>;
}

export interface OrderStatus {
  id: string;
  siteId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  amount: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface EventSummary {
  event: string;
  count: number;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: string;
  videoUrls?: string[];
  isActive?: boolean;
  order?: number;
}

export interface CreateSessionRequest {
  email: string;
}

// Backend returns snake_case field names; mapper in createSession converts to camelCase
export interface CreateSessionResponse {
  sessionToken: string;
  expiresAt: string;
  productIds: string[];
}
