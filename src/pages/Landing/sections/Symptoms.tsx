import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SYMPTOMS = [
  { icon: '\u2764\uFE0F', label: "Серце б'ється" },
  { icon: '\u{1FAC1}', label: 'Важко вдихнути' },
  { icon: '\u{1F630}', label: 'Страх втратити контроль' },
  { icon: '\u{1F32B}\uFE0F', label: 'Дереалізація' },
  { icon: '\u{1F922}', label: 'Нудота або тремор' },
  { icon: '\u{1F4A4}', label: 'Постійне напруження' },
  { icon: '\u{1F504}', label: 'Страх повторення' },
  { icon: '\u{1F50D}', label: 'Перевірки тіла' },
];

export function Symptoms() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10">
          Знайомі відчуття?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
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

        <Button variant="danger" size="lg" onClick={() => navigate('/test')}>
          Перевірити стан
        </Button>
      </div>
    </section>
  );
}
