import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useMyPurchases } from '../../hooks/useMyPurchases';

export function CoursePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { productIds, ready } = useMyPurchases();

  const product = getAllProducts().find((p) => p.id === productId);
  const hasAccess = productId ? productIds.includes(productId) : false;

  useEffect(() => {
    if (ready && !hasAccess) navigate('/checkout', { replace: true });
  }, [ready, hasAccess, navigate]);

  useEffect(() => {
    if (!ready || !hasAccess || !productId) return;
    const key = `toast_shown_${productId}`;
    if (!sessionStorage.getItem(key)) {
      toast.success('Ви отримали доступ до курсу!');
      sessionStorage.setItem(key, '1');
    }
  }, [ready, hasAccess, productId]);

  if (!ready || !hasAccess || !product) return null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-2xl flex flex-col gap-10">
          <div>
            <p className="text-[#f5a623] text-sm font-semibold uppercase tracking-wider mb-2">
              Ваш курс
            </p>
            <h1 className="text-4xl font-black text-white">{product.title}</h1>
            <p className="text-white/50 mt-2">{product.description}</p>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white">Відео</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl aspect-video flex items-center justify-center">
              <p className="text-white/30">Відео буде тут</p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white">Аудіо</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-center">
              <p className="text-white/30">Аудіо буде тут</p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white">Матеріали</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <p className="text-white/30">Текстові матеріали будуть тут</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
