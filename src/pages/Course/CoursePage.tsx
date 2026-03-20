import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useMyPurchases } from '../../hooks/useMyPurchases';
import { useConfig } from '../../context/ConfigContext';

function getYouTubeEmbedUrl(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return url;
  return null;
}

function YouTubeEmbed({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Відео"
      />
    </div>
  );
}

export function CoursePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { productIds, ready } = useMyPurchases();
  const config = useConfig();

  const product = getAllProducts().find((p) => p.id === productId);
  const hasAccess = productId ? productIds.includes(productId) : false;

  const videoUrl = productId ? (config?.products[productId]?.video_url ?? null) : null;
  const textContent = productId ? (config?.products[productId]?.text_content ?? null) : null;

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

          {videoUrl ? (
            <YouTubeEmbed url={videoUrl} />
          ) : !textContent ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white/30">Матеріали з'являться незабаром.</p>
            </div>
          ) : null}

          {textContent && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
