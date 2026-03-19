import { Link } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';

function getContentPath(productId: string): string {
  if (productId === 'basic' || productId === 'support_7_days') return '/support';
  return `/course/${productId}`;
}

export function Header() {
  const { purchasedProductIds, selectedProduct } = useQuizStore();

  const contentPath =
    purchasedProductIds.length > 0
      ? getContentPath(selectedProduct?.id ?? purchasedProductIds[purchasedProductIds.length - 1])
      : null;

  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="inline-flex items-baseline gap-0.5">
        <span className="text-white font-black text-xl tracking-tight">тривога</span>
        <span className="text-[#f5a623] font-bold text-xl">.net</span>
      </Link>

      {contentPath && (
        <Link
          to={contentPath}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Мої матеріали →
        </Link>
      )}
    </header>
  );
}
