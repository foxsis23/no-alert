import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SYMPTOMS = [
  { image: '/sym-heart.webp', label: "Серце б'ється" },
  { image: '/sym-breath.webp', label: 'Важко вдихнути' },
  { image: '/sym-control.webp', label: 'Страх втратити контроль' },
  { image: '/sym-tension.webp', label: 'Нудота або тремор' },
  { image: '/sym-tremor.webp', label: 'Постійне напруження' },
];

export function Symptoms() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10">
          Знайомі відчуття?
        </h2>

        <div className="flex flex-wrap justify-center gap-4 sm:grid sm:grid-cols-3 md:grid-cols-5 mb-12">
          {SYMPTOMS.map((symptom) => (
            <div
              key={symptom.label}
              className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#f5a623]/40 transition-colors aspect-square w-44 sm:w-full flex items-end justify-center"
            >
              <img
                src={symptom.image}
                alt={symptom.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/30 to-transparent" />
              <span className="relative z-10 text-base text-white font-semibold text-center leading-snug p-4">
                {symptom.label}
              </span>
            </div>
          ))}
        </div>

        <Button variant="danger" size="lg" onClick={() => navigate('/test')}>
          Перевірити стан
        </Button>
      </div>
    </section>
  );
}
