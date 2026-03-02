import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';

export function ThankYouPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  function handleRestart() {
    reset();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-4xl">
            ✓
          </div>

          <h1 className="text-4xl font-black text-white">Дякуємо!</h1>

          <p className="text-white/60 text-lg">
            {selectedProduct
              ? `"${selectedProduct.title}" вже доступний для вас.`
              : 'Ваш запит прийнято.'}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left flex flex-col gap-2">
            <p className="text-white/50 text-xs uppercase tracking-wider">Що далі</p>
            <p className="text-white/80">
              Перевірте свою пошту — там буде посилання для доступу до матеріалів.
            </p>
          </div>

          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Повернутись на головну
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
