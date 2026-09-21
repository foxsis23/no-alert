import type { ApiProduct } from './api';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  description: string;
  isHighlighted: boolean;
  imagePlaceholder: string;
  imageSrc: string;
  hasSupport: boolean;
  videoUrls: string[];
}

const IMAGE_BY_ORDER: Record<number, string> = {
  1: '/price-now.webp',
  2: '/price-course.webp',
  3: '/price-support.webp',
};

export function toDisplayProduct(api: ApiProduct, index: number): Product {
  const price = parseFloat(api.price);
  return {
    id: api.id,
    title: api.title,
    subtitle: '',
    price,
    priceLabel: `${price} грн`,
    description: api.description,
    isHighlighted: index === 1,
    imagePlaceholder: '#1a1a2e',
    imageSrc: IMAGE_BY_ORDER[api.order] ?? IMAGE_BY_ORDER[(index % 3) + 1],
    hasSupport: false,
    videoUrls: api.videoUrls ?? [],
  };
}
