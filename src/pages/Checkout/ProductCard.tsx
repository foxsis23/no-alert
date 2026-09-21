import { Zap, Waypoints, MessageCircle } from 'lucide-react';
import type { Product } from '../../types/product';

const ICONS = [Zap, Waypoints, MessageCircle];

interface ProductCardProps {
  product: Product;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProductCard({ product, index, isSelected, onSelect }: ProductCardProps) {
  const Icon = ICONS[index % ICONS.length];
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden text-left w-full h-full transition-all duration-200 flex flex-col cursor-pointer
        ${isSelected ? 'ring-2 ring-[#f5a623] scale-[1.02]' : 'ring-1 ring-white/10 hover:ring-white/30'}
      `}
    >
      <div
        className="h-36 shrink-0 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundColor: product.imagePlaceholder, backgroundImage: `url(${product.imageSrc})` }}
      >
        <Icon className="w-12 h-12 text-white drop-shadow-[0_0_12px_rgba(245,166,35,0.8)]" strokeWidth={1.75} />
      </div>

      <div className={`flex-1 p-4 ${product.isHighlighted ? 'bg-[#e53e3e]' : 'bg-[#1a1a2e]'}`}>
        <p className="font-bold text-white text-sm">{product.title}</p>
        <p className={`text-sm mt-1 font-semibold ${product.isHighlighted ? 'text-white' : 'text-[#f5a623]'}`}>
          {product.priceLabel}
        </p>
        <p className="text-xs text-white/50 mt-1 leading-snug">{product.description}</p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-black text-xs font-bold">
          ✓
        </div>
      )}
    </button>
  );
}
