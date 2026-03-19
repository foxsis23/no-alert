import { useState, useEffect, useRef } from 'react';
import { useQuizStore } from '../store/quizStore';
import { getUserEmail } from '../utils/user';

export function useMyPurchases() {
  const { purchasedProductIds, addPurchasedProduct } = useQuizStore();
  const [ready, setReady] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const email = getUserEmail();
    if (!email) {
      setReady(true);
      return;
    }

    fetch(`/api/my-purchases?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : { productIds: [] }))
      .then(({ productIds }: { productIds: string[] }) => {
        productIds.forEach((id) => addPurchasedProduct(id));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [addPurchasedProduct]);

  return { productIds: purchasedProductIds, ready };
}
