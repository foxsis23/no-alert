import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { useMyPurchases } from '../../hooks/useMyPurchases';
import { saveUserEmail, getUserEmail } from '../../utils/user';
import { useQuizStore } from '../../store/quizStore';

function getContentPath(productId: string): string {
  if (productId === 'basic' || productId === 'support_7_days') return '/support';
  return `/course/${productId}`;
}

function RestoreAccessForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { addPurchasedProduct } = useQuizStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);

    const res = await fetch(`/api/my-purchases?email=${encodeURIComponent(email)}`);
    const data = await res.json() as { productIds: string[] };

    if (data.productIds.length === 0) {
      setNotFound(true);
    } else {
      saveUserEmail(email);
      data.productIds.forEach((id) => addPurchasedProduct(id));
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto text-center">
      <p className="text-white/50 text-sm">
        Введіть email, який ви вказували при оплаті
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
        />
        <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
          {loading ? 'Перевіряємо...' : 'Відновити доступ'}
        </Button>
      </form>
      {notFound && (
        <p className="text-[#e53e3e] text-sm">
          Покупок з цим email не знайдено.{' '}
          <a href="mailto:info@tryvoga.net" className="underline">
            Написати нам
          </a>
        </p>
      )}
    </div>
  );
}

export function MyMaterialsPage() {
  const navigate = useNavigate();
  const { productIds, ready } = useMyPurchases();
  const hasEmail = Boolean(getUserEmail());

  const allProducts = getAllProducts();
  const purchased = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
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
              {!hasEmail && <RestoreAccessForm />}
              {hasEmail && (
                <p className="text-white/40 text-center text-sm">
                  Покупок не знайдено. Можливо, ви використовували інший email?
                </p>
              )}
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
                {purchased.map((product) => {
                  if (!product) return null;
                  return (
                    <div
                      key={product.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6"
                    >
                      <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-white/10">
                        {product.imageSrc ? (
                          <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: product.imagePlaceholder }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                          {product.subtitle}
                        </p>
                        <h2 className="text-white font-bold text-lg leading-tight">{product.title}</h2>
                        <p className="text-white/40 text-sm mt-1 line-clamp-1">{product.description}</p>
                      </div>

                      <button
                        onClick={() => navigate(getContentPath(product.id))}
                        className="shrink-0 bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                      >
                        Відкрити →
                      </button>
                    </div>
                  );
                })}
              </div>

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
