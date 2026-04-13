import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useQuizStore } from '../../store/quizStore';
import { useProducts } from '../../lib/queries';

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

function VideoCarousel({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0);
  const total = urls.length;

  if (total === 0) return null;

  if (total === 1) {
    return <YouTubeEmbed url={urls[0]} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <YouTubeEmbed url={urls[index]} />
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white/60 hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          ← Назад
        </button>
        <span className="text-white/40 text-sm tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white/60 hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Далі →
        </button>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap">
        {urls.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === index ? 'bg-[#f5a623]' : 'bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

export function CoursePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const { data: products, isLoading } = useProducts();
  const product = products?.find((p) => p.id === productId) ?? null;

  const hasAccess = productId ? purchasedProductIds.includes(productId) : false;

  useEffect(() => {
    if (productId === 'noalert_1') { navigate('/course/basic', { replace: true }); return; }
    if (!isLoading && !hasAccess) navigate('/checkout', { replace: true });
  }, [isLoading, hasAccess, productId, navigate]);


  if (isLoading || !hasAccess || !product) return null;

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

          {(product.videoUrls ?? []).length > 0 ? (
            <VideoCarousel urls={product.videoUrls ?? []} />
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white/30">Матеріали з'являться незабаром.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
