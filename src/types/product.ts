export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number | null;
  priceLabel: string;
  description: string;
  isHighlighted: boolean;
  imagePlaceholder: string;
  imageSrc: string;
  hasSupport: boolean;
}
