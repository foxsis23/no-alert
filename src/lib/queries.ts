import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchProducts, fetchProduct, createPayment, createHutkoPayment } from './api';
import type { CreatePaymentRequest } from '../types/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: (req: CreatePaymentRequest) => createPayment(req),
  });
}

export function useCreateHutkoPayment() {
  return useMutation({
    mutationFn: (req: CreatePaymentRequest) => createHutkoPayment(req),
  });
}
