import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden text-left w-full transition-all duration-200
        ${isSelected ? 'ring-2 ring-[#f5a623] scale-[1.02]' : 'ring-1 ring-white/10 hover:ring-white/30'}
      `}
    >
      {/* Image placeholder */}
      <div
        className="w-full h-28 flex items-center justify-center text-white/20 text-sm"
        style={{ backgroundColor: product.imagePlaceholder }}
      >
        {product.subtitle}
      </div>

      <div className={`p-4 ${product.isHighlighted ? 'bg-[#e53e3e]' : 'bg-[#1a1a2e]'}`}>
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
