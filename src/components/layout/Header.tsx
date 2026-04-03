import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { useSessionStore } from '../../store/sessionStore';
import { createSession } from '../../lib/api';

export function Header() {
  const { purchasedProductIds } = useQuizStore();
  const setSession = useSessionStore((s) => s.setSession);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { sessionToken, expiresAt, productIds } = await createSession(email.trim());
      setSession(sessionToken, expiresAt, productIds, 'replace');
      setShowModal(false);
      setEmail('');
      navigate('/my-materials');
    } catch {
      setError('Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-baseline gap-0.5">
          <span className="text-white font-black text-xl tracking-tight">тривога</span>
          <span className="text-[#f5a623] font-bold text-xl">.net</span>
        </Link>

        {purchasedProductIds.length > 0 ? (
          <Link
            to="/my-materials"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Мої матеріали →
          </Link>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
          >
            Увійти
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Увійти</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/30 hover:text-white/60 text-xl cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-white/50 text-sm">
              Введіть email, який використовували під час покупки
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5a623]/50 disabled:opacity-50 transition-colors"
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-[#f5a623] hover:bg-[#f5a623]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-black font-bold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Шукаємо...' : 'Знайти мої матеріали'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
