import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Waypoints, MessageCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useQuizStore } from '../../../store/quizStore';
import { useProducts } from '../../../lib/queries';
import { toDisplayProduct } from '../../../types/product';

// Per-tier presentation (by order index). Titles/prices come from the API.
const META = [
  {
    Icon: Zap,
    subtitle: 'Швидкий план дій, коли тривога вже почалася.',
    features: ['Що зробити в перші хвилини', '3 техніки стабілізації', 'Доступ одразу'],
    cta: 'Отримати план',
  },
  {
    Icon: Waypoints,
    subtitle: 'Покрокова програма, яка допомагає зрозуміти причини тривоги та послабити її прояви.',
    features: ['Покрокова відеопрограма', 'Розбір причин тривоги', 'Техніки, що послаблюють прояви'],
    cta: 'Почати курс',
  },
  {
    Icon: MessageCircle,
    subtitle: 'Персональні рекомендації та супровід протягом тижня.',
    features: ['Персональні рекомендації', 'Супровід протягом тижня', 'Відповіді на твої запитання'],
    cta: 'Отримати підтримку',
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const { purchasedProductIds, setSelectedProductId } = useQuizStore();
  const { data: apiProducts } = useProducts();

  const products = useMemo(
    () => (apiProducts ?? []).map((p, i) => toDisplayProduct(p, i)),
    [apiProducts],
  );

  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Тарифи</h2>
        <div className="flex flex-wrap justify-center items-stretch gap-5">
          {products.map((product, i) => {
            const purchased = purchasedProductIds.includes(product.id);
            const highlighted = product.isHighlighted;
            const meta = META[i % META.length];
            const { Icon } = meta;

            const go = () => {
              if (purchased) { navigate(`/course/${product.id}`); return; }
              setSelectedProductId(product.id);
              navigate('/checkout');
            };

            return (
              <div
                key={product.id}
                className={`relative flex flex-col rounded-2xl p-6 w-full sm:w-64 bg-[#12121f] transition-transform hover:scale-[1.02] ${
                  highlighted
                    ? 'ring-2 ring-[#f5a623] shadow-[0_0_40px_rgba(245,166,35,0.15)]'
                    : 'ring-1 ring-white/10'
                } ${purchased ? 'ring-2 ring-[#f5a623]' : ''}`}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#f5a623] text-black text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                    Найпопулярніше
                  </span>
                )}

                <Icon className="w-9 h-9 text-[#f5a623]" strokeWidth={1.75} />

                <h3 className="mt-4 font-bold text-white text-lg">{product.title}</h3>
                <p className="mt-1 text-sm text-white/50 leading-snug">{meta.subtitle}</p>

                <ul className="mt-4 flex flex-col gap-2">
                  {meta.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-[#f5a623] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-3xl font-black text-white mt-6">{product.priceLabel}</p>

                <Button
                  variant={highlighted ? 'primary' : 'ghost'}
                  size="md"
                  fullWidth
                  onClick={go}
                  className="mt-4"
                >
                  {purchased ? 'Відкрити' : meta.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
