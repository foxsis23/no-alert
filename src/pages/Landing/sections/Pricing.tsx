import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../../store/quizStore';
import { useProducts } from '../../../lib/queries';
import { toDisplayProduct } from '../../../types/product';

export function Pricing() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const { data: apiProducts } = useProducts();

  const products = useMemo(
    () => (apiProducts ?? []).map((p, i) => toDisplayProduct(p, i)),
    [apiProducts],
  );

  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Тарифи</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {products.map((product) => {
            const purchased = purchasedProductIds.includes(product.id);
            return (
              <button
                key={product.id}
                onClick={() => navigate(purchased ? `/course/${product.id}` : '/checkout')}
                className={`relative rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02] cursor-pointer w-full sm:w-52 ${
                  product.isHighlighted ? 'ring-2 ring-[#e53e3e]' : ''
                } ${purchased ? 'ring-2 ring-[#f5a623]' : ''}`}
              >
                <img
                  src={product.imageSrc}
                  alt="pricing"
                  className="w-full h-36 object-cover object-center"
                  style={{ backgroundColor: product.imagePlaceholder }}
                />
                <div
                  className={`p-4 ${
                    product.isHighlighted ? 'bg-[#e53e3e]' : 'bg-[#1a1a2e]'
                  }`}
                >
                  <p className="font-bold text-white text-base">{product.title}</p>
                  <p className={`text-sm mt-1 ${product.isHighlighted ? 'text-white/90' : 'text-[#f5a623]'}`}>
                    {product.priceLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
