import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { PRODUCTS } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types/product';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct } = useQuizStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedProduct) {
      const recommended =
        result?.level === 'panic'
          ? PRODUCTS.find((p) => p.id === 'support')
          : result?.level === 'generalized'
          ? PRODUCTS.find((p) => p.id === 'course')
          : PRODUCTS.find((p) => p.id === 'basic');
      if (recommended) setSelectedProduct(recommended);
    }
  }, [result, selectedProduct, setSelectedProduct]);

  function handleProductSelect(product: Product) {
    setSelectedProduct(product);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !name || !email) return;
    setIsSubmitting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    navigate('/thank-you');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header minimal />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Оберіть тариф</h1>
            <p className="text-white/50 mt-2">Обрана допомога буде доступна одразу після оплати</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onSelect={() => handleProductSelect(product)}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Контактні дані</h2>

            <input
              type="text"
              placeholder="Ваше ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-white/30 text-sm text-center">
              💳 Поле для введення картки (Stripe/LiqPay інтеграція)
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedProduct || !name || !email || isSubmitting}
            >
              {isSubmitting
                ? 'Обробка...'
                : `Оплатити${selectedProduct?.price ? ` ${selectedProduct.price} грн` : ''}`}
            </Button>

            <p className="text-center text-white/30 text-xs">
              Це не медпослуга. Не замінює звернення до лікаря.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
