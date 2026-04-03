import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { useProducts } from '../../lib/queries';
import { toDisplayProduct } from '../../types/product';
import { TYPE_TO_PRODUCT_ORDER } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import { submitToLiqPay } from '../../utils/liqpay';
import { trackEvent } from '../../utils/analytics';
import { saveUserEmail } from '../../utils/user';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProductId, setSelectedProductId, addPurchasedProduct } =
    useQuizStore();
  const { data: apiProducts, isLoading } = useProducts();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  const products = useMemo(
    () => (apiProducts ?? []).map((p, i) => toDisplayProduct(p, i)),
    [apiProducts],
  );

  // Auto-select recommended product
  useEffect(() => {
    if (!result || !apiProducts?.length) return;
    if (selectedProductId && apiProducts.some((p) => p.id === selectedProductId)) return;

    const recommendedOrder = TYPE_TO_PRODUCT_ORDER[result.type];
    const recommended = apiProducts.find((p) => p.order === recommendedOrder);
    setSelectedProductId(recommended?.id ?? apiProducts[0].id);
  }, [result, apiProducts, selectedProductId, setSelectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct || !name || !email || !phone) return;

    setError(null);
    setSubmitting(true);
    saveUserEmail(email);
    trackEvent('click_pay', { product_id: selectedProduct.id, price: selectedProduct.price });
    addPurchasedProduct(selectedProduct.id);

    try {
      await submitToLiqPay({
        amount: selectedProduct.price,
        description: selectedProduct.title,
        orderId: crypto.randomUUID(),
        resultUrl: `${window.location.origin}/thank-you`,
      });
    } catch (err) {
      trackEvent('payment_fail', { product_id: selectedProduct.id });
      setError(
        err instanceof Error ? err.message : 'Помилка при переході до оплати',
      );
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center">
        <p className="text-white/50">Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Оберіть тариф</h1>
            <p className="text-white/50 mt-2">
              Обрана допомога буде доступна одразу після оплати
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProductId === product.id}
                onSelect={() => setSelectedProductId(product.id)}
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

            <input
              type="tel"
              placeholder="+380..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                <a
                  href="/offer"
                  target="_blank"
                  className="text-[#f5a623] hover:underline"
                >
                  умовами оферти
                </a>{' '}
                та{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-[#f5a623] hover:underline"
                >
                  політикою конфіденційності
                </a>
              </span>
            </label>

            {error && (
              <p className="text-[#e53e3e] text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={
                !selectedProduct ||
                !name ||
                !email ||
                !phone ||
                !agreedToTerms ||
                submitting
              }
            >
              {submitting
                ? 'Переходимо до оплати...'
                : `Оплатити ${selectedProduct?.price ? `${selectedProduct.price} грн` : ''}`}
            </Button>

            <p className="text-center text-white/30 text-xs">
              Оплата захищена LiqPay. Це не медпослуга. Не замінює звернення
              до лікаря.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
