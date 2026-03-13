import { useNavigate } from 'react-router-dom';
import { PRODUCTS, getAllProducts } from '../../../data/products';
import { useQuizStore } from '../../../store/quizStore';

export function Pricing() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const allProducts = getAllProducts();

  function isPurchased(productId: string) {
    return purchasedProductIds.includes(productId);
  }

  function getDestination(productId: string) {
    if (isPurchased(productId)) {
      const product = allProducts.find((p) => p.id === productId);
      return product?.hasSupport ? '/support' : `/course/${productId}`;
    }
    return '/checkout';
  }

  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Тарифи</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => {
            const purchased = isPurchased(product.id);
            return (
              <button
                key={product.id}
                onClick={() => navigate(getDestination(product.id))}
                className={`relative rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02] cursor-pointer ${
                  product.isHighlighted ? 'ring-2 ring-[#e53e3e]' : ''
                } ${purchased ? 'ring-2 ring-[#f5a623]' : ''}`}
              >
                <img
                  src={product.imageSrc}
                  alt='pricing'
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
