import type { Product } from '../types/product';

export const PRODUCTS: Product[] = [
  {
    id: 'basic',
    title: 'Що робити зараз',
    subtitle: 'Миттєва допомога',
    price: 29,
    priceLabel: 'Доступ від 29 грн',
    description: 'Покрокові техніки для швидкого зняття тривоги прямо зараз.',
    isHighlighted: false,
    imagePlaceholder: '#2d3748',
  },
  {
    id: 'course',
    title: 'Курс лікаря',
    subtitle: 'Повний курс',
    price: 149,
    priceLabel: '149 грн',
    description: 'Авторський курс психіатра — від причин тривоги до стійких змін.',
    isHighlighted: true,
    imagePlaceholder: '#742a2a',
  },
  {
    id: 'support',
    title: 'Підтримка 7 днів',
    subtitle: '7 днів допомоги',
    price: null,
    priceLabel: '7 днів підтримки',
    description: 'Персональний супровід і підтримка протягом тижня.',
    isHighlighted: false,
    imagePlaceholder: '#1a202c',
  },
];
