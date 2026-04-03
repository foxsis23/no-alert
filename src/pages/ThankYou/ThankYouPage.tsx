import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { useSessionStore } from '../../store/sessionStore';
import { useProducts } from '../../lib/queries';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';
import { trackEvent } from '../../utils/analytics';
import { createSession } from '../../lib/api';
import { getUserEmail } from '../../utils/user';

export function ThankYouPage() {
  const navigate = useNavigate();
  const { result, selectedProductId, purchasedProductIds, setSelectedProductId, addPurchasedProduct, resetQuiz } =
    useQuizStore();
  const setSession = useSessionStore((s) => s.setSession);
  const { data: apiProducts } = useProducts();

  const selectedProduct = useMemo(
    () => apiProducts?.find((p) => p.id === selectedProductId) ?? null,
    [apiProducts, selectedProductId],
  );

  useEffect(() => {
    if (!result) { navigate('/', { replace: true }); return; }

    trackEvent('open_delivery', { product_id: selectedProductId });

    // Give immediate in-memory access for this session
    if (selectedProductId) addPurchasedProduct(selectedProductId);

    // Create a server session so future visits don't require the email gate
    const email = getUserEmail();
    if (email) {
      createSession(email)
        .then(({ sessionToken, expiresAt, productIds }) => {
          setSession(sessionToken, expiresAt, productIds, 'merge');
        })
        .catch(() => {
          // Session creation failed — user still has in-memory access for this session
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) return null;

  // Upsell logic per TZ:
  // noalert_1 (29 грн) → noalert_3 (7 днів підтримки)
  // noalert_3 (7 днів) → noalert_2 (курс)
  // noalert_2 (курс) → noalert_3 (підтримка)
  const UPSELL_MAP: Record<string, string> = {
    noalert_1: 'noalert_3',
    noalert_3: 'noalert_2',
    noalert_2: 'noalert_3',
  };
  const upsellId = selectedProductId ? UPSELL_MAP[selectedProductId] : null;
  const suggestions = upsellId && !purchasedProductIds.includes(upsellId)
    ? (apiProducts ?? []).filter((p) => p.id === upsellId)
    : [];

  function handleUpsell(productId: string) {
    trackEvent(`click_upsell_${productId}`, { product_id: productId });
    setSelectedProductId(productId);
    navigate('/checkout');
  }

  function handleRestart() {
    resetQuiz();
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

          {/* Open purchased content immediately */}
          {selectedProduct && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                if (selectedProduct.id === 'noalert_3') navigate('/support');
                else if (selectedProduct.id === 'noalert_1') navigate('/course/basic');
                else navigate(`/course/${selectedProduct.id}`);
              }}
            >
              {selectedProduct.id === 'noalert_3'
                ? 'Перейти в підтримку →'
                : `Відкрити \u00AB${selectedProduct.title}\u00BB \u2192`}
            </Button>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-3 text-left">
              <p className="text-white/40 text-xs uppercase tracking-wider text-center">
                Може стати в нагоді
              </p>
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{product.title}</p>
                    <p className="text-white/50 text-sm mt-0.5">{product.description}</p>
                  </div>
                  <button
                    onClick={() => handleUpsell(product.id)}
                    className="shrink-0 cursor-pointer bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    {parseFloat(product.price)} грн
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
