import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { PRODUCTS, getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import { redirectToLiqPay, generateOrderId } from '../../utils/liqpay';
import { trackEvent } from '../../utils/analytics';
import { saveUserEmail } from '../../utils/user';
import { useConfig } from '../../context/ConfigContext';
import type { AnxietyType } from '../../types/quiz';
import type { Product } from '../../types/product';

function getResultPath(_productId: string): string {
  return '/my-materials';
}

const TYPE_TO_PRODUCT: Record<AnxietyType, string> = {
  panic_cycle: 'support_7_days',
  body_hyperfocus: 'course',
  fear_of_recurrence: 'course',
  background_tension: 'course',
  combined_type: 'support_7_days',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct, addPurchasedProduct } = useQuizStore();
  const config = useConfig();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  const enabledProducts = PRODUCTS.filter(
    (p) => config?.products[p.id]?.is_enabled !== false
  );

  useEffect(() => {
    if (result && !selectedProduct) {
      const recommendedId = TYPE_TO_PRODUCT[result.type];
      const allProds = getAllProducts();
      const recommended = allProds.find((p) => p.id === recommendedId);
      if (recommended && config?.products[recommended.id]?.is_enabled !== false) {
        setSelectedProduct(recommended);
      } else if (enabledProducts.length > 0) {
        setSelectedProduct(enabledProducts[0]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, selectedProduct, setSelectedProduct, config]);

  function getEffectivePrice(product: Product): number | null {
    return config?.products[product.id]?.price ?? product.price;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct || !name || !email) return;

    setIsSubmitting(true);
    setError(null);
    saveUserEmail(email);
    const price = getEffectivePrice(selectedProduct);
    trackEvent(`purchase_${selectedProduct.id}`, { price });

    addPurchasedProduct(selectedProduct.id);

    if (price === null) {
      navigate(getResultPath(selectedProduct.id));
      return;
    }

    try {
      await redirectToLiqPay({
        amount: price,
        description: `${selectedProduct.title} — тривога.net`,
        orderId: generateOrderId(selectedProduct.id, email),
        customerName: name,
        customerEmail: email,
        resultUrl: getResultPath(selectedProduct.id),
      });
    } catch (err) {
      trackEvent('payment_fail', { product_id: selectedProduct?.id });
      setError(
        err instanceof Error ? err.message : 'Помилка при переході до оплати',
      );
      setIsSubmitting(false);
    }
  }

  const effectivePrice = selectedProduct ? getEffectivePrice(selectedProduct) : null;
  const isPriceless = effectivePrice === null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Оберіть тариф</h1>
            <p className="text-white/50 mt-2">Обрана допомога буде доступна одразу після оплати</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {enabledProducts.map((product) => {
              const displayProduct = {
                ...product,
                price: getEffectivePrice(product),
                priceLabel: `${getEffectivePrice(product)} грн`,
              };
              return (
                <div key={product.id} className="w-full sm:w-44">
                <ProductCard
                  product={displayProduct}
                  isSelected={selectedProduct?.id === product.id}
                  onSelect={() => setSelectedProduct(product)}
                />
              </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Контактні дані</h2>

            <input
              type="text"
              placeholder="Ваше ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#f5a623] shrink-0"
              />
              <span className="text-white/50 text-sm leading-snug">
                Я погоджуюсь з{' '}
                <a href="/offer" target="_blank" className="text-[#f5a623] hover:underline">
                  умовами оферти
                </a>{' '}
                та{' '}
                <a href="/privacy" target="_blank" className="text-[#f5a623] hover:underline">
                  політикою конфіденційності
                </a>
              </span>
            </label>

            {error && (
              <p className="text-[#e53e3e] text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant={isPriceless ? 'ghost' : 'primary'}
              size="lg"
              fullWidth
              disabled={!selectedProduct || !name || !email || !agreedToTerms || isSubmitting}
            >
              {isSubmitting
                ? 'Переходимо до оплати...'
                : isPriceless
                ? 'Залишити заявку'
                : `Оплатити через LiqPay ${effectivePrice ? `${effectivePrice} грн` : ''}`}
            </Button>

            <p className="text-center text-white/30 text-xs">
              Оплата захищена LiqPay. Це не медпослуга. Не замінює звернення до лікаря.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
