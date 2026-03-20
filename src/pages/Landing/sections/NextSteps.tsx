import { useConfig } from '../../../context/ConfigContext';
import { getAllProducts } from '../../../data/products';

const PRODUCT_IDS = ['upsell_panic_audio', 'upsell_stability_7days', 'support_7_days', 'course'];

const STEP_META: Record<string, { icon: string; description: string }> = {
  upsell_panic_audio: {
    icon: '🎧',
    description: '5-хвилинне аудіо, що зупиняє напад паніки. Слухайте у будь-який момент.',
  },
  upsell_stability_7days: {
    icon: '📅',
    description: 'Щоденний протокол відновлення нервової системи на тиждень.',
  },
  support_7_days: {
    icon: '💬',
    description: 'Персональний супровід і відповіді на ваші запитання протягом тижня.',
  },
  course: {
    icon: '📚',
    description: 'Авторський курс психіатра — від причин тривоги до стійких змін.',
  },
};

export function NextSteps() {
  const config = useConfig();
  const allProducts = getAllProducts();

  const steps = PRODUCT_IDS
    .filter((id) => config?.products[id]?.is_enabled !== false)
    .map((id) => {
      const product = allProducts.find((p) => p.id === id);
      if (!product) return null;
      const price = config?.products[id]?.price ?? product.price;
      return { id, title: product.title, price, ...STEP_META[id] };
    })
    .filter(Boolean);

  if (steps.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#1a1a2e]/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          Якщо хочете пройти далі
        </h2>
        <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
          Після отримання результату — оберіть формат підтримки, що підходить саме вам
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => step && (
            <div
              key={step.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl">{step.icon}</span>
                {step.price != null && (
                  <span className="text-[#f5a623] font-bold text-sm shrink-0">{step.price} грн</span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
