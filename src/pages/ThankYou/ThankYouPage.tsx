import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { UPSELL_MAP, getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';
import { trackEvent } from '../../utils/analytics';
import type { Product } from '../../types/product';

export function ThankYouPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const upsellIds = selectedProduct ? (UPSELL_MAP[selectedProduct.id] ?? []) : [];
  const upsellProducts = upsellIds
    .map((id) => getAllProducts().find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 2);

  function handleUpsell(product: Product) {
    trackEvent('upsell_purchase', { product_id: product.id });
    setSelectedProduct(product);
    navigate('/checkout');
  }

  function handleRestart() {
    reset();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-4xl">
            {'\u2713'}
          </div>

          <h1 className="text-4xl font-black text-white">Дякуємо!</h1>

          <p className="text-white/60 text-lg">
            {selectedProduct
              ? `\u00AB${selectedProduct.title}\u00BB вже доступний для вас.`
              : 'Ваш запит прийнято.'}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left flex flex-col gap-2">
            <p className="text-white/50 text-xs uppercase tracking-wider">Що далі</p>
            <p className="text-white/80">
              Перевірте свою пошту — там буде посилання для доступу до матеріалів.
            </p>
          </div>

          {/* Go to support if product includes support */}
          {selectedProduct?.hasSupport && (
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/support')}>
              Перейти в підтримку {'\u2192'}
            </Button>
          )}

          {/* Upsells */}
          {upsellProducts.length > 0 && (
            <div className="flex flex-col gap-3 text-left">
              <p className="text-white/40 text-xs uppercase tracking-wider text-center">
                Може стати в нагоді
              </p>
              {upsellProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{product.title}</p>
                    <p className="text-white/50 text-sm mt-0.5">{product.description}</p>
                  </div>
                  <button
                    onClick={() => handleUpsell(product)}
                    className="shrink-0 bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    {product.priceLabel}
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Повернутись на головну
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
