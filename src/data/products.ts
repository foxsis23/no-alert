import type { Product } from '../types/product';

export const PRODUCTS: Product[] = [
  {
    id: 'basic',
    title: 'Що робити зараз',
    subtitle: 'Швидка допомога',
    price: 59,
    priceLabel: '59 грн',
    description: 'Покрокові техніки для швидкого зняття тривоги прямо зараз.',
    isHighlighted: false,
    imagePlaceholder: '#2d3748',
    hasSupport: false,
  },
  {
    id: 'course',
    title: 'Курс від тривоги',
    subtitle: 'Повний курс',
    price: 249,
    priceLabel: '249 грн',
    description: 'Авторський курс психіатра — від причин тривоги до стійких змін.',
    isHighlighted: true,
    imagePlaceholder: '#742a2a',
    hasSupport: true,
  },
  {
    id: 'support_7_days',
    title: 'Підтримка 7 днів',
    subtitle: '7 днів допомоги',
    price: 149,
    priceLabel: '149 грн',
    description: 'Персональний супровід і підтримка протягом тижня.',
    isHighlighted: false,
    imagePlaceholder: '#1a202c',
    hasSupport: true,
  },
];

export const UPSELL_PRODUCTS: Product[] = [
  {
    id: 'upsell_panic_audio',
    title: 'Аудіо при паніці',
    subtitle: 'Миттєва допомога',
    price: 49,
    priceLabel: '49 грн',
    description: '5-хвилинне аудіо, яке зупиняє паніку. Слухай у будь-який момент.',
    isHighlighted: false,
    imagePlaceholder: '#2d3748',
    hasSupport: false,
  },
  {
    id: 'upsell_stability_7days',
    title: 'Стабільність 7 днів',
    subtitle: 'Тижневий протокол',
    price: 89,
    priceLabel: '89 грн',
    description: 'Щоденний план відновлення нервової системи на 7 днів.',
    isHighlighted: false,
    imagePlaceholder: '#1a365d',
    hasSupport: false,
  },
];

// Map: purchased product id → upsell product ids to show
export const UPSELL_MAP: Record<string, string[]> = {
  basic: ['course', 'upsell_panic_audio'],
  course: ['support_7_days'],
  support_7_days: ['upsell_stability_7days'],
  upsell_panic_audio: ['course'],
  upsell_stability_7days: ['course'],
};

export function getAllProducts(): Product[] {
  return [...PRODUCTS, ...UPSELL_PRODUCTS];
}
