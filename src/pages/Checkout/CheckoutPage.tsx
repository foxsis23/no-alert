import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { useProducts, useCreateHutkoPayment, useCreateHutkoTestPayment } from '../../lib/queries';
import { toDisplayProduct } from '../../types/product';
import { TYPE_TO_PRODUCT_ORDER } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import { trackEvent } from '../../utils/analytics';
import { saveUserEmail } from '../../utils/user';
import { pollOrderStatus, type PollHandle } from '../../utils/pollOrderStatus';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProductId, setSelectedProductId } =
    useQuizStore();
  const { data: apiProducts, isLoading } = useProducts();
  const createHutkoPayment = useCreateHutkoPayment();
  const createHutkoTestPayment = useCreateHutkoTestPayment();
  const testMode =
    import.meta.env.VITE_HUTKO_TEST === '1' ||
    import.meta.env.VITE_HUTKO_TEST === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<PollHandle | null>(null);

  // Stop polling if the user leaves the page.
  useEffect(() => () => pollRef.current?.cancel(), []);

  const products = useMemo(
    () => (apiProducts ?? []).map((p, i) => toDisplayProduct(p, i)),
    [apiProducts],
  );

  // Auto-select: use recommended product if quiz was taken, otherwise first product
  useEffect(() => {
    if (!apiProducts?.length) return;
    if (selectedProductId && apiProducts.some((p) => p.id === selectedProductId)) return;

    if (result) {
      const recommendedOrder = TYPE_TO_PRODUCT_ORDER[result.type];
      const recommended = apiProducts.find((p) => p.order === recommendedOrder);
      setSelectedProductId(recommended?.id ?? apiProducts[0].id);
    } else {
      setSelectedProductId(apiProducts[0].id);
    }
  }, [result, apiProducts, selectedProductId, setSelectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct || !name || !email || !phone) return;

    setError(null);
    setSubmitting(true);
    saveUserEmail(email);
    trackEvent('click_pay', { product_id: selectedProduct.id, price: selectedProduct.price });

    // Open the checkout tab synchronously (inside the click gesture) so it is
    // not popup-blocked; we fill its URL once the backend returns checkoutUrl.
    // Keeping this tab alive lets us poll the order status, which is the only
    // way the desktop learns about a QR payment completed on another device.
    const payWindow = window.open('', '_blank');
    const productId = selectedProduct.id;

    try {
      const base = {
        productId,
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
      };
      const { orderId, checkoutUrl } = testMode
        ? await createHutkoTestPayment.mutateAsync({
            ...base,
            responseUrl: `${window.location.origin}/thank-you`,
          })
        : await createHutkoPayment.mutateAsync(base);

      if (payWindow) {
        payWindow.location.href = checkoutUrl;
        // This tab stays on checkout and polls; QR-on-phone still resolves here.
        setAwaitingPayment(true);
        pollRef.current = pollOrderStatus(orderId, (status) => {
          setAwaitingPayment(false);
          if (status === 'PAID') {
            setSelectedProductId(productId);
            navigate(`/thank-you?order=${orderId}`);
          } else {
            trackEvent('payment_fail', { product_id: productId });
            setError('Оплата не пройшла. Спробуйте ще раз.');
            setSubmitting(false);
          }
        });
      } else {
        // Popup blocked — fall back to same-tab redirect (works for same-device
        // card payments via responseUrl; QR cross-device won't resolve here).
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      payWindow?.close();
      trackEvent('payment_fail', { product_id: productId });
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

  function handleCancelWaiting() {
    pollRef.current?.cancel();
    pollRef.current = null;
    setAwaitingPayment(false);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      {awaitingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d1a]/90 px-6">
          <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
            <div className="w-10 h-10 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-semibold text-lg">
              Очікуємо підтвердження оплати
            </p>
            <p className="text-white/50 text-sm">
              Завершіть оплату у вікні, що відкрилось. Оплата по QR-коду —
              на телефоні. Не закривайте цю вкладку, доступ відкриється
              автоматично.
            </p>
            <button
              type="button"
              onClick={handleCancelWaiting}
              className="text-white/30 hover:text-white/50 text-sm underline cursor-pointer transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          {testMode && (
            <div className="rounded-xl border border-[#f5a623]/40 bg-[#f5a623]/10 px-4 py-2 text-center text-sm font-semibold text-[#f5a623]">
              Тестовий режим оплати (Fondy sandbox) — кошти не списуються
            </div>
          )}

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
              Оплата захищена Hutko. Це не медпослуга. Не замінює звернення
              до лікаря.
            </p>

            <p className="text-center text-white/30 text-xs">
              Вже купляли раніше?{' '}
              <button
                type="button"
                onClick={() => navigate('/my-materials')}
                className="text-[#f5a623]/70 hover:text-[#f5a623] underline cursor-pointer transition-colors"
              >
                Відновити доступ
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
