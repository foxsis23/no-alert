import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { PRODUCTS, getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import { redirectToLiqPay, generateOrderId } from '../../utils/liqpay';
import { trackEvent } from '../../utils/analytics';
import type { AnxietyType } from '../../types/quiz';

const TYPE_TO_PRODUCT: Record<AnxietyType, string> = {
  panic_cycle: 'support_7_days',
  hypervigilance: 'course',
  catastrophizing: 'course',
  background_anxiety: 'course',
  overload: 'support_7_days',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct, addPurchasedProduct } = useQuizStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  useEffect(() => {
    if (result && !selectedProduct) {
      const recommendedId = TYPE_TO_PRODUCT[result.type];
      const recommended = getAllProducts().find((p) => p.id === recommendedId);
      if (recommended) setSelectedProduct(recommended);
    }
  }, [result, selectedProduct, setSelectedProduct]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct || !name || !email) return;

    setIsSubmitting(true);
    setError(null);
    trackEvent(`purchase_${selectedProduct.id}`, { price: selectedProduct.price });

    addPurchasedProduct(selectedProduct.id);

    if (selectedProduct.price === null) {
      navigate(`/course/${selectedProduct.id}`);
      return;
    }

    try {
      await redirectToLiqPay({
        amount: selectedProduct.price,
        description: `${selectedProduct.title} — тривога.net`,
        orderId: generateOrderId(selectedProduct.id, email),
        customerName: name,
        customerEmail: email,
        resultUrl: `/course/${selectedProduct.id}`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка при переході до оплати',
      );
      setIsSubmitting(false);
    }
  }

  const isPriceless = selectedProduct?.price === null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Оберіть тариф</h1>
            <p className="text-white/50 mt-2">Обрана допомога буде доступна одразу після оплати</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onSelect={() => setSelectedProduct(product)}
              />
            ))}
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
                : `Оплатити через LiqPay ${selectedProduct?.price ? `${selectedProduct.price} грн` : ''}`}
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
