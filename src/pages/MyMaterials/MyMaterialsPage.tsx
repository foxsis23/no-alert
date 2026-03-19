import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

function getContentPath(productId: string): string {
  if (productId === 'basic' || productId === 'support_7_days') return '/support';
  return `/course/${productId}`;
}

export function MyMaterialsPage() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();

  useEffect(() => {
    if (purchasedProductIds.length === 0) navigate('/', { replace: true });
  }, [purchasedProductIds, navigate]);

  const allProducts = getAllProducts();
  const purchased = purchasedProductIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  if (purchased.length === 0) return null;

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
                      <img
                        src={product.imageSrc}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
