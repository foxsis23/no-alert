import { useConfig } from '../../../context/ConfigContext';

const DEFAULT_TRUST_TEXT =
  'Цей сервіс не є медичною послугою, консультацією або діагностикою. Матеріали мають інформаційний та підтримуючий характер. Якщо ваші симптоми сильні або незвичні — зверніться до лікаря.';

export function Trust() {
  const config = useConfig();
  const text = config?.site.trust_text ?? DEFAULT_TRUST_TEXT;

  return (
    <section className="py-12 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-white/50 text-base leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}
