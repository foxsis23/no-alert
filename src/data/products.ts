// Products are now fetched from the API via useProducts() hook.
// This file is kept only for the TYPE_TO_PRODUCT recommendation mapping.

import type { AnxietyType } from '../types/quiz';

// Maps anxiety type to recommended product order index (1-based, matches API product.order)
export const TYPE_TO_PRODUCT_ORDER: Record<AnxietyType, number> = {
  panic_cycle: 3,
  body_hyperfocus: 2,
  fear_of_recurrence: 2,
  background_tension: 2,
  combined_type: 3,
};
