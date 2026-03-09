import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SYMPTOMS = [
  { image: '/1.png', label: "Серце б'ється" },
  { image: '/2.png', label: 'Важко вдихнути' },
  { image: '/3.png', label: 'Страх втратити контроль' },
  { image: '/4.png', label: 'Нудота або тремор' },
  { image: '/5.png', label: 'Постійне напруження' },
];

export function Symptoms() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10">
          Знайомі відчуття?
        </h2>

        <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-3 md:grid-cols-5 mb-10">
          {SYMPTOMS.map((symptom) => (
            <div
              key={symptom.label}
              className="relative rounded-xl overflow-hidden border border-white/10 hover:border-white/25 transition-colors aspect-square flex items-end justify-center w-48 sm:w-full"
            >
              <img src={symptom.image} alt={symptom.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="relative z-10 text-xs sm:text-sm text-white font-medium text-center leading-tight p-2 sm:p-3">
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
