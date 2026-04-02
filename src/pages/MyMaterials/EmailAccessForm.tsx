import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { createSession } from '../../lib/api';
import { useSessionStore } from '../../store/sessionStore';

type FormState = 'idle' | 'loading' | 'no_purchases' | 'error';

export function EmailAccessForm() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const setSession = useSessionStore((s) => s.setSession);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setFormState('loading');
    setErrorMessage('');

    try {
      const { sessionToken, expiresAt, productIds } = await createSession(email.trim());
      setSession(sessionToken, expiresAt, productIds, 'replace');

      if (productIds.length === 0) {
        setFormState('no_purchases');
      }
      // If productIds.length > 0, the parent re-renders and unmounts this form
    } catch {
      setFormState('error');
      setErrorMessage('Щось пішло не так. Спробуйте ще раз.');
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-black text-white">Доступ до матеріалів</h2>
        <p className="text-white/50 text-sm">
          Введіть email, який використовували під час покупки
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={formState === 'loading'}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5a623]/50 disabled:opacity-50 transition-colors"
        />

        {formState === 'error' && (
          <p className="text-red-400 text-sm text-center">{errorMessage}</p>
        )}

        {formState === 'no_purchases' && (
          <p className="text-white/50 text-sm text-center">
            За цим email покупок не знайдено.
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={formState === 'loading' || !email.trim()}
        >
          {formState === 'loading' ? 'Шукаємо…' : 'Знайти мої матеріали'}
        </Button>
      </form>
    </div>
  );
}
