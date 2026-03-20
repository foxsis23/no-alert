import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useMyPurchases } from '../../hooks/useMyPurchases';

interface CourseBlock {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  text_content: string | null;
  order_index: number;
}

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

  const product = getAllProducts().find((p) => p.id === productId);
  const hasAccess = productId ? productIds.includes(productId) : false;

  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(true);

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

  useEffect(() => {
    if (!productId) return;
    setBlocksLoading(true);
    fetch(`/api/course-blocks?product_id=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data: { blocks: CourseBlock[] }) => setBlocks(data.blocks ?? []))
      .catch(() => setBlocks([]))
      .finally(() => setBlocksLoading(false));
  }, [productId]);

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

          {blocksLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white/30">Матеріали курсу з'являться тут незабаром.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {blocks.map((block, index) => (
                <section key={block.id} className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#f5a623]/15 text-[#f5a623] text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-snug">{block.title}</h2>
                  </div>

                  {block.description && (
                    <p className="text-white/60 text-sm leading-relaxed pl-10">{block.description}</p>
                  )}

                  {block.video_url && (
                    <div className="pl-10">
                      <YouTubeEmbed url={block.video_url} />
                    </div>
                  )}

                  {block.text_content && (
                    <div className="pl-10 bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {block.text_content}
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
