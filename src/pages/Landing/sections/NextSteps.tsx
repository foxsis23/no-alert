import { useMemo } from 'react';
import { useProducts } from '../../../lib/queries';

export function NextSteps() {
  const { data: products } = useProducts();

  const steps = useMemo(() => {
    if (!products) return [];
    return products.map((p) => ({
      id: p.id,
      title: p.title,
      price: parseFloat(p.price),
      description: p.description,
    }));
  }, [products]);

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
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-white font-bold text-lg">{step.title}</h3>
                <span className="text-[#f5a623] font-bold text-sm shrink-0">
                  {step.price} грн
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
