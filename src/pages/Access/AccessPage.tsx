import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';


export function AccessPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addPurchasedProduct } = useQuizStore();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) { setError(true); return; }

    fetch(`/api/access?token=${token}`)
      .then((r) => r.json())
      .then((data: { valid: boolean; productId?: string }) => {
        if (!data.valid || !data.productId) { setError(true); return; }
        addPurchasedProduct(data.productId);
        navigate('/my-materials', { replace: true });
      })
      .catch(() => setError(true));
  }, [token, navigate, addPurchasedProduct]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-2xl font-black">Посилання недійсне</p>
        <p className="text-white/50">Можливо, воно вже використане або прострочене.</p>
        <p className="text-white/40 text-sm">
          Напишіть нам:{' '}
          <a href="mailto:info@tryvoga.net" className="text-[#f5a623] hover:underline">
            info@tryvoga.net
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Відкриваємо доступ...</p>
      </div>
    </div>
  );
}
