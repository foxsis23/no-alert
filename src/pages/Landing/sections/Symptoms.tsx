import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SYMPTOMS = [
  { icon: '❤️', label: "Серце б'ється" },
  { icon: '🫁', label: 'Важко вдихнути' },
  { icon: '😰', label: 'Страх втратити контроль' },
  { icon: '🌫️', label: 'Дереалізація' },
  { icon: '🤢', label: 'Нудота' },
];

export function Symptoms() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10">
          Знайомі відчуття?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {SYMPTOMS.map((symptom) => (
            <div
              key={symptom.label}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-colors"
            >
              <span className="text-3xl">{symptom.icon}</span>
              <span className="text-sm text-white/80 text-center leading-tight">
                {symptom.label}
              </span>
            </div>
          ))}
        </div>

        <Button variant="danger" size="lg" onClick={() => navigate('/quiz')}>
          Перевірити стан
        </Button>
      </div>
    </section>
  );
}
