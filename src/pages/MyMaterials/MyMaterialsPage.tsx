import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../lib/queries';
import { toDisplayProduct } from '../../types/product';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useQuizStore } from '../../store/quizStore';
import { useSessionStore, isSessionValid } from '../../store/sessionStore';
import { EmailAccessForm } from './EmailAccessForm';

export function MyMaterialsPage() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const { data: apiProducts, isLoading } = useProducts();
  const sessionToken = useSessionStore((s) => s.sessionToken);
  const sessionExpiresAt = useSessionStore((s) => s.sessionExpiresAt);
  const clearSession = useSessionStore((s) => s.clearSession);
  const setProductIds = useQuizStore((s) => s.setProductIds);

  const hasValidSession = isSessionValid(sessionToken, sessionExpiresAt);

  const purchased = useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts
      .filter((p) => purchasedProductIds.includes(p.id))
      .map((p, i) => toDisplayProduct(p, i));
  }, [apiProducts, purchasedProductIds]);

  function handleUseDifferentEmail() {
    clearSession();
    setProductIds([]);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show email gate only when local purchases are empty and there's no valid session.
  // If purchasedProductIds is non-empty the user just bought on this device — let them through.
  if (purchasedProductIds.length === 0 && !hasValidSession) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <EmailAccessForm />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          <div>
            <p className="text-[#f5a623] text-sm font-semibold uppercase tracking-wider mb-2">
              Ваші матеріали
            </p>
            <h1 className="text-4xl font-black text-white">Мої покупки</h1>
          </div>

          {purchased.length === 0 ? (
            <div className="flex flex-col gap-8">
              <p className="text-white/40 text-center text-sm">
                Покупок не знайдено.
              </p>
              <button
                onClick={handleUseDifferentEmail}
                className="text-white/30 hover:text-white/50 text-sm transition-colors text-center"
              >
                Використати інший email
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-white/30 hover:text-white/50 text-sm transition-colors text-center"
              >
                ← На головну
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {purchased.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-white/10">
                      <img
                        src={product.imageSrc}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-white font-bold text-lg leading-tight">
                        {product.title}
                      </h2>
                      <p className="text-white/40 text-sm mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (product.id === 'noalert_3') navigate('/support');
                        else if (product.id === 'noalert_1') navigate('/course/basic');
                        else navigate(`/course/${product.id}`);
                      }}
                      className="shrink-0 bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Відкрити →
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUseDifferentEmail}
                className="text-white/30 hover:text-white/50 text-sm transition-colors text-center"
              >
                Використати інший email
              </button>

              <button
                onClick={() => navigate('/')}
                className="text-white/30 hover:text-white/50 text-sm transition-colors text-center"
              >
                ← На головну
              </button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
