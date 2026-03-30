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
  videoUrl: string | null;
}

const IMAGE_BY_ORDER: Record<number, string> = {
  1: '/pricing1.png',
  2: '/pricing2.png',
  3: '/pricing3.png',
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
    imageSrc: IMAGE_BY_ORDER[api.order] ?? `/pricing${(index % 3) + 1}.png`,
    hasSupport: false,
    videoUrl: api.videoUrl,
  };
}
