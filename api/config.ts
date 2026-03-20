import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';

const DEFAULT_SITE = {
  hero_title: 'Накриває?',
  hero_subtitle: 'Зараз перевіримо, що це.',
  trust_text:
    'Цей сервіс не є медичною послугою, консультацією або діагностикою. Матеріали мають інформаційний та підтримуючий характер. Якщо ваші симптоми сильні або незвичні — зверніться до лікаря.',
};

const DEFAULT_PRODUCTS: Record<string, { price: number; is_enabled: boolean; audio_url: string | null; video_url: string | null; text_content: string | null }> = {
  basic: { price: 29, is_enabled: true, audio_url: null, video_url: null, text_content: null },
  course: { price: 249, is_enabled: true, audio_url: null, video_url: null, text_content: null },
  support_7_days: { price: 149, is_enabled: true, audio_url: null, video_url: null, text_content: null },
  upsell_panic_audio: { price: 49, is_enabled: true, audio_url: null, video_url: null, text_content: null },
  upsell_stability_7days: { price: 79, is_enabled: true, audio_url: null, video_url: null, text_content: null },
};

const DEFAULT_RESULTS: Record<string, { title: string; preview_phrase_1: string; preview_phrase_2: string; full_description: string; recommendation: string }> = {
  panic_cycle: {
    title: 'Панічний цикл',
    preview_phrase_1: 'Твоє тіло реагує на помилкову тривогу як на реальну небезпеку.',
    preview_phrase_2: 'Це виснажливо — але є конкретні техніки, які розривають цей цикл.',
    full_description: "Твої симптоми вказують на панічний цикл: тіло навчилось запускати реакцію «бий або тікай» без реальної загрози. Серцебиття, задишка, страх збожеволіти — це фізіологія, не небезпека. Цей стан добре піддається корекції з правильними інструментами.",
    recommendation: 'Техніки заземлення та дихальні вправи зупиняють напад за 3–7 хвилин. Ми підготували покрокові сценарії саме для тебе.',
  },
  body_hyperfocus: {
    title: 'Тілесна гіперфіксація',
    preview_phrase_1: 'Ти постійно прислухаєшся до тіла — і кожен сигнал здається загрозливим.',
    preview_phrase_2: 'Це замкнене коло: чим більше стежиш, тим більше симптомів помічаєш.',
    full_description: "Тілесна гіперфіксація — стан, коли увага постійно спрямована на фізичні відчуття. Серцебиття, поколювання, напруга — мозок інтерпретує їх як сигнал небезпеки. Це провокує тривогу, яка підсилює самі ці відчуття. Пошук симптомів в інтернеті лише посилює цикл.",
    recommendation: "Техніки перенаправлення уваги та когнітивна робота з «тілесними сигналами» розривають цей цикл. Ми підготували конкретний план.",
  },
  fear_of_recurrence: {
    title: 'Страх повторення',
    preview_phrase_1: 'Навіть у спокійний момент ти чекаєш, що тривога повернеться.',
    preview_phrase_2: 'Уникання ситуацій лише зміцнює цей страх — але є вихід.',
    full_description: "Страх повторення — це коли минулий досвід тривоги або паніки стає джерелом постійного очікування «наступного разу». Ти уникаєш місць, ситуацій, людей. Але уникання не зменшує страх — воно його консервує і дає йому рости.",
    recommendation: "Поступова «десенсибілізація» та техніки прийняття страху повертають свободу дій. Курс охоплює кожен крок.",
  },
  background_tension: {
    title: 'Фонова напруга',
    preview_phrase_1: "Тривога стала постійним фоном — ти вже майже не пам'ятаєш, яким буває справжній спокій.",
    preview_phrase_2: 'Це хронічне виснаження нервової системи, і воно піддається корекції.',
    full_description: "Фонова напруга — хронічний стан, коли нервова система перебуває в режимі помірної тривоги майже весь час. Немає різких нападів, але є постійне напруження, яке заважає розслабитись, насолодитись моментом, нормально спати.",
    recommendation: 'Структурований підхід із щоденними практиками знижує базовий рівень напруги за кілька тижнів. Ми покажемо, з чого почати.',
  },
  combined_type: {
    title: 'Змішана тривога',
    preview_phrase_1: 'У тебе поєднуються кілька видів тривоги одночасно — це складніше, але цілком вирішувано.',
    preview_phrase_2: 'Такий стан вимагає комплексного підходу, а не одного прийому.',
    full_description: "Змішана тривога означає, що кілька механізмів активні одночасно: і панічні напади, і тілесна фіксація, і страх повторення, і фоновий дискомфорт. Це не «найгірший варіант» — це просто інша картина, яка потребує ширшого погляду.",
    recommendation: 'Комплексна програма охоплює всі активні механізми тривоги — послідовно та без перевантаження.',
  },
};

export type SiteConfig = typeof DEFAULT_SITE;
export type ProductConfig = typeof DEFAULT_PRODUCTS[string];
export type ResultConfig = typeof DEFAULT_RESULTS[string];

export interface AppConfigShape {
  site: SiteConfig;
  products: Record<string, ProductConfig>;
  results: Record<string, ResultConfig>;
}

export async function getMergedConfig(): Promise<AppConfigShape> {
  const [siteRes, productsRes, resultsRes] = await Promise.all([
    supabase.from('site_config').select('key, value'),
    supabase.from('products_config').select('*'),
    supabase.from('result_types_config').select('*'),
  ]);

  const site: Record<string, string> = { ...DEFAULT_SITE };
  for (const row of siteRes.data ?? []) {
    site[row.key] = row.value;
  }

  const products: Record<string, ProductConfig> = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  for (const row of productsRes.data ?? []) {
    const { product_id, updated_at, ...fields } = row as Record<string, unknown> & { product_id: string; updated_at: unknown };
    products[product_id] = { ...products[product_id], ...fields } as ProductConfig;
  }

  const results: Record<string, ResultConfig> = JSON.parse(JSON.stringify(DEFAULT_RESULTS));
  for (const row of resultsRes.data ?? []) {
    const { type_id, updated_at, ...fields } = row as Record<string, unknown> & { type_id: string; updated_at: unknown };
    results[type_id] = { ...results[type_id], ...fields } as ResultConfig;
  }

  return { site: site as SiteConfig, products, results };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const config = await getMergedConfig();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(config);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
