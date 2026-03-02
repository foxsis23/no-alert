# тривога.net Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 5-type quiz with weighted scoring, /result paywall, /support page with 3-scenario session flows, upsells on /thank-you, and correct route names (/test, /result).

**Architecture:** Refactor quiz data layer to per-type weighted scoring; update all navigation to use /test and /result; add paywall UI to ResultsPage; add /support and /support/session/:type routes with scenario content; add upsell products and upsell section to ThankYouPage.

**Tech Stack:** React 19, TypeScript strict, Zustand v5, React Router v7 (no @types/react-router-dom needed), Tailwind CSS 4 (via @tailwindcss/vite), Vite

---

## Context: Current State

The app has these routes: /, /quiz, /results, /checkout, /thank-you.
TZ requires: /test (not /quiz), /result (not /results).

Current quiz: 8 questions, 4 answer options (Ніколи/Іноді/Часто/Завжди, scores 0-3), 3 anxiety levels (situational/generalized/panic), total-score-based classification.

Target quiz: 10 questions with per-type weights, 3 answer options (Рідко/Іноді/Часто, scores 0/1/2), 5 anxiety types (panic_cycle/hypervigilance/catastrophizing/background_anxiety/overload), dominant-type classification.

Key file paths to know:
- `src/types/quiz.ts` — QuizQuestion, AnswerOption, AnxietyLevel, AnxietyResult
- `src/data/questions.ts` — QUIZ_QUESTIONS, ANSWER_OPTIONS
- `src/data/anxietyTypes.ts` — ANXIETY_RESULTS, computeAnxietyResult
- `src/store/quizStore.ts` — Zustand store
- `src/hooks/useQuiz.ts` — quiz navigation hook, currently navigates to '/results'
- `src/pages/Landing/sections/Hero.tsx` — CTA navigates to '/quiz'
- `src/pages/Results/ResultsPage.tsx` — guard navigates to '/quiz', uses AnxietyLevel
- `src/pages/Checkout/CheckoutPage.tsx` — uses result.level to recommend product
- `src/App.tsx` — route definitions

---

## Task 1: Refactor quiz types and data layer

**Files:**
- Modify: `src/types/quiz.ts`
- Modify: `src/data/questions.ts`
- Modify: `src/data/anxietyTypes.ts`
- Modify: `src/store/quizStore.ts`

### Step 1: Replace `src/types/quiz.ts` entirely

```typescript
export interface QuizQuestion {
  id: number;
  text: string;
  weights: Record<AnxietyType, number>;
}

export interface AnswerOption {
  label: string;
  score: number;
}

export type AnxietyType =
  | 'panic_cycle'
  | 'hypervigilance'
  | 'catastrophizing'
  | 'background_anxiety'
  | 'overload';

export interface AnxietyResult {
  type: AnxietyType;
  title: string;
  previewPhrases: [string, string];
  description: string;
  recommendation: string;
  scores: Record<AnxietyType, number>;
}
```

### Step 2: Replace `src/data/questions.ts` entirely

```typescript
import type { QuizQuestion, AnswerOption } from '../types/quiz';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Рідко', score: 0 },
  { label: 'Іноді', score: 1 },
  { label: 'Часто', score: 2 },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Чи буває у тебе серцебиття, задишка або тремтіння без видимої причини?',
    weights: { panic_cycle: 2, hypervigilance: 1, catastrophizing: 0, background_anxiety: 0, overload: 0 },
  },
  {
    id: 2,
    text: 'Чи виникають у тебе раптові хвилі страху або сильного неспокою?',
    weights: { panic_cycle: 2, hypervigilance: 0, catastrophizing: 0, background_anxiety: 0, overload: 1 },
  },
  {
    id: 3,
    text: 'Чи боїшся ти збожеволіти, вмерти або втратити контроль під час нападу тривоги?',
    weights: { panic_cycle: 2, hypervigilance: 0, catastrophizing: 1, background_anxiety: 0, overload: 0 },
  },
  {
    id: 4,
    text: 'Чи уникаєш ти певних місць або ситуацій через страх нового нападу?',
    weights: { panic_cycle: 1, hypervigilance: 2, catastrophizing: 0, background_anxiety: 0, overload: 0 },
  },
  {
    id: 5,
    text: 'Чи відчуваєш ти постійну настороженість, ніби щось ось-ось трапиться?',
    weights: { panic_cycle: 0, hypervigilance: 2, catastrophizing: 0, background_anxiety: 1, overload: 0 },
  },
  {
    id: 6,
    text: 'Чи думаєш ти найчастіше про найгірший можливий сценарій?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 2, background_anxiety: 1, overload: 0 },
  },
  {
    id: 7,
    text: 'Чи важко тобі зупинити потік тривожних думок?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 2, background_anxiety: 0, overload: 1 },
  },
  {
    id: 8,
    text: 'Чи відчуваєш ти тривогу майже весь час, навіть коли зовні все добре?',
    weights: { panic_cycle: 0, hypervigilance: 1, catastrophizing: 0, background_anxiety: 2, overload: 0 },
  },
  {
    id: 9,
    text: 'Чи виснажує тебе тривога фізично або емоційно?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 0, background_anxiety: 1, overload: 2 },
  },
  {
    id: 10,
    text: 'Чи важко тобі розслабитись або відпочити навіть у спокійній обстановці?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 1, background_anxiety: 0, overload: 2 },
  },
];
```

### Step 3: Replace `src/data/anxietyTypes.ts` entirely

```typescript
import type { AnxietyResult, AnxietyType } from '../types/quiz';
import { QUIZ_QUESTIONS } from './questions';

type ResultTemplate = Omit<AnxietyResult, 'type' | 'scores'>;

export const ANXIETY_RESULTS: Record<AnxietyType, ResultTemplate> = {
  panic_cycle: {
    title: 'Панічний цикл',
    previewPhrases: [
      'Твоє тіло реагує на помилкову тривогу як на реальну небезпеку.',
      'Це виснажливо — але є конкретні техніки, які розривають цей цикл.',
    ],
    description:
      'Твої симптоми вказують на панічний цикл: тіло навчилось запускати реакцію «бий або тікай» без реальної загрози. Серцебиття, задишка, страх збожеволіти — це фізіологія, не небезпека. Цей стан добре піддається корекції з правильними інструментами.',
    recommendation:
      'Техніки заземлення та дихальні вправи зупиняють напад за 3–7 хвилин. Ми підготували покрокові сценарії саме для тебе.',
  },
  hypervigilance: {
    title: 'Гіпервигляність',
    previewPhrases: [
      'Твій мозок постійно сканує оточення в пошуках загрози.',
      'Це захисний механізм, що перестав відрізняти реальне від уявного.',
    ],
    description:
      'Гіпервигляність — стан хронічної готовності до небезпеки. Ти швидко реагуєш на звуки та рухи, уникаєш потенційно небезпечних місць. Нервова система застрягла в режимі тривоги, що призводить до виснаження.',
    recommendation:
      'Поступова «десенсибілізація» та техніки переключення уваги відновлюють відчуття безпеки. Курс охоплює кожен крок.',
  },
  catastrophizing: {
    title: 'Катастрофізація',
    previewPhrases: [
      'Твоє мислення автоматично будує найгірший сценарій.',
      'Це когнітивна пастка — і з неї є вихід.',
    ],
    description:
      '«А раптом...», «Що, якщо...» — ці конструкції стали звичним фоном твого мислення. Катастрофізація виснажує і заважає приймати рішення. Мозок навчився зупинятись на негативі як на «безпечному» варіанті.',
    recommendation:
      'КПТ-техніки зупиняють автоматичне «розгортання катастрофи» і повертають мислення до реальності.',
  },
  background_anxiety: {
    title: 'Фонова тривога',
    previewPhrases: [
      'Тривога стала постійним фоном твого життя.',
      'Ти настільки звик до неї, що забув, яким буває справжній спокій.',
    ],
    description:
      'Фонова (генералізована) тривога — це хронічне відчуття неспокою, яке присутнє майже весь час. Немає одного конкретного страху — є загальне відчуття, що щось піде не так. Це вимотує і заважає насолоджуватись навіть хорошими моментами.',
    recommendation:
      'Структурований підхід з регулярними практиками знижує базовий рівень тривоги за кілька тижнів.',
  },
  overload: {
    title: 'Перевантаження',
    previewPhrases: [
      'Твоя нервова система накопичила критичний рівень стресу.',
      'Тіло та розум сигналізують: потрібне перезавантаження.',
    ],
    description:
      'Перевантаження — стан, коли нервова система вичерпала ресурс адаптації. Виснаження, неможливість розслабитись, дратівливість від дрібниць — це не слабкість, це сигнал. Якщо не реагувати, стан поступово погіршується.',
    recommendation:
      'Протоколи відновлення нервової системи повертають здатність відпочивати і реагувати на стрес без надмірності.',
  },
};

export function computeAnxietyResult(answers: number[]): AnxietyResult {
  const scores: Record<AnxietyType, number> = {
    panic_cycle: 0,
    hypervigilance: 0,
    catastrophizing: 0,
    background_anxiety: 0,
    overload: 0,
  };

  QUIZ_QUESTIONS.forEach((q, i) => {
    const answer = answers[i] === -1 ? 0 : answers[i];
    (Object.keys(q.weights) as AnxietyType[]).forEach((type) => {
      scores[type] += answer * q.weights[type];
    });
  });

  const dominantType = (Object.keys(scores) as AnxietyType[]).reduce(
    (a, b) => (scores[a] >= scores[b] ? a : b),
  );

  return { ...ANXIETY_RESULTS[dominantType], type: dominantType, scores };
}
```

### Step 4: Update `src/store/quizStore.ts`

Change `computeResult` to pass the `answers` array to `computeAnxietyResult` (not a total score). Also remove the `AnxietyLevel` import and replace with `AnxietyType` if needed.

The updated file:

```typescript
import { create } from 'zustand';
import type { AnxietyResult } from '../types/quiz';
import type { Product } from '../types/product';
import { QUIZ_QUESTIONS } from '../data/questions';
import { computeAnxietyResult } from '../data/anxietyTypes';

interface QuizState {
  answers: number[];
  currentQuestion: number;
  result: AnxietyResult | null;
  selectedProduct: Product | null;
}

interface QuizActions {
  setAnswer: (questionIndex: number, score: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  computeResult: () => void;
  setSelectedProduct: (product: Product) => void;
  reset: () => void;
}

const initialState: QuizState = {
  answers: new Array(QUIZ_QUESTIONS.length).fill(-1),
  currentQuestion: 0,
  result: null,
  selectedProduct: null,
};

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  ...initialState,

  setAnswer: (questionIndex, score) =>
    set((state) => {
      const answers = [...state.answers];
      answers[questionIndex] = score;
      return { answers };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestion: Math.min(state.currentQuestion + 1, QUIZ_QUESTIONS.length - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    })),

  computeResult: () => {
    const { answers } = get();
    set({ result: computeAnxietyResult(answers) });
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  reset: () => set(initialState),
}));
```

### Step 5: Verify TypeScript compiles

Run: `npm run build` (or `npx tsc --noEmit`)
Expected: no errors. If there are errors, they will be in files that still reference the old `AnxietyLevel` type or `result.level` — those will be fixed in subsequent tasks.

### Step 6: Commit

```bash
git add src/types/quiz.ts src/data/questions.ts src/data/anxietyTypes.ts src/store/quizStore.ts
git commit -m "feat: refactor quiz to 5-type weighted scoring system"
```

---

## Task 2: Fix routes and all navigation references

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Landing/sections/Hero.tsx`
- Modify: `src/hooks/useQuiz.ts`
- Modify: `src/pages/Results/ResultsPage.tsx` (guard only, full rewrite in Task 3)

**Important:** Do NOT modify ResultsPage beyond the guard redirect in this task. The full ResultsPage rewrite happens in Task 3.

### Step 1: Update `src/App.tsx`

Change route paths: `/quiz` → `/test`, `/results` → `/result`. Add placeholder imports for Support pages (they'll be created in Tasks 5 and 6).

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { ResultsPage } from './pages/Results/ResultsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { ThankYouPage } from './pages/ThankYou/ThankYouPage';
import { SupportPage } from './pages/Support/SupportPage';
import { SessionPage } from './pages/Support/SessionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<QuizPage />} />
        <Route path="/result" element={<ResultsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/session/:type" element={<SessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Note: SupportPage and SessionPage files don't exist yet — they will be created in Tasks 5 and 6. Create stub files now so App.tsx compiles:

Create `src/pages/Support/SupportPage.tsx`:
```typescript
export function SupportPage() {
  return <div>Support</div>;
}
```

Create `src/pages/Support/SessionPage.tsx`:
```typescript
export function SessionPage() {
  return <div>Session</div>;
}
```

### Step 2: Update `src/pages/Landing/sections/Hero.tsx`

Change `navigate('/quiz')` to `navigate('/test')`:

Old line:
```typescript
onClick={() => navigate('/quiz')}
```
New line:
```typescript
onClick={() => navigate('/test')}
```

### Step 3: Update `src/hooks/useQuiz.ts`

Change `navigate('/results')` to `navigate('/result')`:

Old line:
```typescript
navigate('/results');
```
New line:
```typescript
navigate('/result');
```

### Step 4: Update guard in `src/pages/Results/ResultsPage.tsx`

Change the guard from `navigate('/quiz', ...)` to `navigate('/test', ...)`:

Old line:
```typescript
if (!result) navigate('/quiz', { replace: true });
```
New line:
```typescript
if (!result) navigate('/test', { replace: true });
```

Also update `handleRestart` in ResultsPage:
Old:
```typescript
navigate('/quiz');
```
New:
```typescript
navigate('/test');
```

### Step 5: Verify dev server runs

Run: `npm run dev`
Open browser. Click "Почати" on landing — should navigate to `/test`. Complete quiz — should navigate to `/result`.

### Step 6: Commit

```bash
git add src/App.tsx src/pages/Landing/sections/Hero.tsx src/hooks/useQuiz.ts src/pages/Results/ResultsPage.tsx src/pages/Support/SupportPage.tsx src/pages/Support/SessionPage.tsx
git commit -m "feat: rename routes /quiz→/test and /results→/result, add support stubs"
```

---

## Task 3: Rewrite ResultsPage with 5-type colors and paywall

**Files:**
- Modify: `src/pages/Results/ResultsPage.tsx`

The new page shows:
1. Type badge (colour-coded per type)
2. Type title (h1)
3. Two preview phrases from `result.previewPhrases`
4. A "locked" section with blurred content + overlay CTA "Розблокувати повний аналіз — 29 грн" → navigates to `/checkout`
5. Ghost "Пройти ще раз" button

The paywall section shows blurred text and a centred CTA button on top. Use `filter: blur(6px)` via inline style on the blurred content and `pointer-events: none` to prevent interaction.

### Step 1: Replace `src/pages/Results/ResultsPage.tsx` entirely

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import type { AnxietyType } from '../../types/quiz';

const TYPE_COLORS: Record<AnxietyType, { badge: string; dot: string }> = {
  panic_cycle: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  hypervigilance: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  catastrophizing: {
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  background_anxiety: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  overload: {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
};

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/test', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const colors = TYPE_COLORS[result.type];

  function handleRestart() {
    reset();
    navigate('/test');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          {/* Badge */}
          <div className="text-center">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              Твій результат
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-white text-center">{result.title}</h1>

          {/* Free preview phrases */}
          <div className="flex flex-col gap-3">
            {result.previewPhrases.map((phrase, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white/80 text-base leading-relaxed"
              >
                {phrase}
              </div>
            ))}
          </div>

          {/* Paywall section */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* Blurred content behind the gate */}
            <div
              className="flex flex-col gap-4 p-5 pointer-events-none select-none"
              style={{ filter: 'blur(6px)' }}
              aria-hidden="true"
            >
              <p className="text-white/70 text-base leading-relaxed">
                Детальний опис твого типу тривоги та причини його появи. Що відбувається в нервовій
                системі і чому симптоми саме такі.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Рекомендація</p>
                <p className="text-white/90 text-base">
                  Персоналізований план дій на основі твого типу тривоги.
                </p>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/80 to-transparent flex flex-col items-center justify-end pb-6 px-5 gap-3">
              <p className="text-white/60 text-sm text-center">
                Повний аналіз + персональний план дій
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/checkout')}
              >
                Розблокувати — від 29 грн
              </Button>
            </div>
          </div>

          {/* Restart */}
          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Пройти ще раз
          </Button>
        </div>
      </main>
    </div>
  );
}
```

### Step 2: Verify in browser

Run `npm run dev`, complete the quiz, land on `/result`. Verify:
- Correct type badge color
- Two preview phrases visible
- Blurred section with "Розблокувати" button visible
- Clicking "Розблокувати" goes to /checkout
- "Пройти ще раз" goes back to /test

### Step 3: Commit

```bash
git add src/pages/Results/ResultsPage.tsx
git commit -m "feat: add paywall to result page with 5-type color coding"
```

---

## Task 4: Update product catalog and CheckoutPage

**Files:**
- Modify: `src/types/product.ts`
- Modify: `src/data/products.ts`
- Modify: `src/pages/Checkout/CheckoutPage.tsx`

### Step 1: Update `src/types/product.ts`

Add `hasSupport` field:

```typescript
export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number | null;
  priceLabel: string;
  description: string;
  isHighlighted: boolean;
  imagePlaceholder: string;
  hasSupport: boolean;
}
```

### Step 2: Replace `src/data/products.ts`

The main products shown on /checkout are the first 3. Upsell products are used only in /thank-you.

```typescript
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
```

### Step 3: Update `src/pages/Checkout/CheckoutPage.tsx`

Two changes:
1. `result.level` → `result.type` (the field was renamed in Task 1)
2. Update product ID recommendations for 5 types
3. Update product lookup from PRODUCTS to use `getAllProducts()` for the recommendations, but keep the 3-product grid using `PRODUCTS`

Replace the entire file:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { PRODUCTS, getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { ProductCard } from './ProductCard';
import { redirectToLiqPay, generateOrderId } from '../../utils/liqpay';
import type { AnxietyType } from '../../types/quiz';

const TYPE_TO_PRODUCT: Record<AnxietyType, string> = {
  panic_cycle: 'support_7_days',
  hypervigilance: 'course',
  catastrophizing: 'course',
  background_anxiety: 'course',
  overload: 'support_7_days',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct } = useQuizStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  useEffect(() => {
    if (result && !selectedProduct) {
      const recommendedId = TYPE_TO_PRODUCT[result.type];
      const recommended = getAllProducts().find((p) => p.id === recommendedId);
      if (recommended) setSelectedProduct(recommended);
    }
  }, [result, selectedProduct, setSelectedProduct]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct || !name || !email) return;

    setIsSubmitting(true);
    setError(null);

    if (selectedProduct.price === null) {
      navigate('/thank-you');
      return;
    }

    try {
      await redirectToLiqPay({
        amount: selectedProduct.price,
        description: `${selectedProduct.title} — тривога.net`,
        orderId: generateOrderId(selectedProduct.id),
        customerName: name,
        customerEmail: email,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка при переході до оплати',
      );
      setIsSubmitting(false);
    }
  }

  const isPriceless = selectedProduct?.price === null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

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
                onSelect={() => setSelectedProduct(product)}
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
            />

            {error && (
              <p className="text-[#e53e3e] text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant={isPriceless ? 'ghost' : 'primary'}
              size="lg"
              fullWidth
              disabled={!selectedProduct || !name || !email || isSubmitting}
            >
              {isSubmitting
                ? 'Переходимо до оплати...'
                : isPriceless
                ? 'Залишити заявку'
                : `Оплатити через LiqPay ${selectedProduct?.price ? `${selectedProduct.price} грн` : ''}`}
            </Button>

            <p className="text-center text-white/30 text-xs">
              Оплата захищена LiqPay. Це не медпослуга. Не замінює звернення до лікаря.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
```

### Step 4: Verify TypeScript compiles

Run: `npx tsc --noEmit`
Expected: no errors.

### Step 5: Commit

```bash
git add src/types/product.ts src/data/products.ts src/pages/Checkout/CheckoutPage.tsx
git commit -m "feat: update product catalog with upsells and fix checkout for 5-type recommendations"
```

---

## Task 5: Implement /support page

**Files:**
- Modify (replace stub): `src/pages/Support/SupportPage.tsx`

The /support page has:
- Header
- Title "Підтримка"
- Subtitle "Що відбувається зараз?"
- 3 large scenario buttons (each a `<button>` styled as a card)
- Legal disclaimer at bottom
- Guard: if no selectedProduct or !selectedProduct.hasSupport → redirect to /checkout

### Step 1: Replace `src/pages/Support/SupportPage.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';

const SCENARIOS = [
  {
    type: 'panic_wave',
    emoji: '🌊',
    title: 'Мене накрило',
    description: 'Паніка зараз, серце б'є, важко дихати',
  },
  {
    type: 'after_effect',
    emoji: '🌫️',
    title: 'Не відпускає',
    description: 'Після нападу — слабкість, тремтіння, спустошення',
  },
  {
    type: 'fear_of_repeat',
    emoji: '🔄',
    title: 'Боюсь повторення',
    description: 'Страх, що це станеться знову',
  },
] as const;

export function SupportPage() {
  const navigate = useNavigate();
  const { selectedProduct } = useQuizStore();

  useEffect(() => {
    if (!selectedProduct || !selectedProduct.hasSupport) {
      navigate('/checkout', { replace: true });
    }
  }, [selectedProduct, navigate]);

  if (!selectedProduct || !selectedProduct.hasSupport) return null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Підтримка</h1>
            <p className="text-white/50 mt-2">Що відбувається зараз?</p>
          </div>

          <div className="flex flex-col gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.type}
                onClick={() => navigate(`/support/session/${scenario.type}`)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{scenario.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg group-hover:text-[#f5a623] transition-colors">
                      {scenario.title}
                    </p>
                    <p className="text-white/50 text-sm mt-1">{scenario.description}</p>
                  </div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors text-xl">→</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-white/25 text-xs leading-relaxed">
            Це не медична послуга і не замінює звернення до лікаря чи психолога.
            Матеріали мають інформаційний та підтримуючий характер.
          </p>
        </div>
      </main>
    </div>
  );
}
```

### Step 2: Verify in browser

Navigate to `/support` without selectedProduct → should redirect to /checkout.
After setting selectedProduct with hasSupport=true → should show the 3 scenario buttons.

To test manually: complete the quiz, buy "Курс від тривоги" or "Підтримка 7 днів", then navigate to /support.

### Step 3: Commit

```bash
git add src/pages/Support/SupportPage.tsx
git commit -m "feat: add /support page with 3 scenario buttons"
```

---

## Task 6: Implement /support/session/:type page

**Files:**
- Create: `src/data/scenarios.ts`
- Modify (replace stub): `src/pages/Support/SessionPage.tsx`

The session page:
1. Shows phrases one by one (manual advance with "Далі →" button)
2. After last phrase: rating screen (1–5 scale with emoji buttons)
3. After rating: completion screen with "Повернутись до підтримки" button

### Step 1: Create `src/data/scenarios.ts`

```typescript
export type ScenarioType = 'panic_wave' | 'after_effect' | 'fear_of_repeat';

export interface Scenario {
  type: ScenarioType;
  title: string;
  phrases: string[];
}

export const SCENARIOS: Record<ScenarioType, Scenario> = {
  panic_wave: {
    type: 'panic_wave',
    title: 'Мене накрило',
    phrases: [
      'Зупинись. Ти в безпеці прямо зараз.',
      'Зроби повільний вдих — на 4 рахунки.',
      'Затримай повітря — на 4 рахунки.',
      'Повільно видихни — на 6 рахунків.',
      'Паніка — це хвиля. Вона досягне піку і спаде.',
      'Твоє тіло реагує на помилкову тривогу. Небезпеки немає.',
      'Продовжуй дихати. Ти справляєшся.',
      'Хвиля відступає. Ти впорався.',
    ],
  },
  after_effect: {
    type: 'after_effect',
    title: 'Не відпускає',
    phrases: [
      'Найгостріше вже позаду.',
      'Твоє тіло зараз відновлюється — це нормально.',
      'Тремтіння або слабкість після нападу — природна реакція.',
      'Дай собі 15–20 хвилин спокою.',
      'Якщо можеш — випий трохи води.',
      'Ти не зробив нічого поганого. Це просто тіло.',
      'Завтра буде легше.',
    ],
  },
  fear_of_repeat: {
    type: 'fear_of_repeat',
    title: 'Боюсь повторення',
    phrases: [
      'Страх повторення — сам по собі не небезпечний.',
      'Він не означає, що атака обов\'язково станеться знову.',
      'Твоє тіло вчиться реагувати інакше.',
      'Кожен раз, коли ти проходиш через це, стає трохи легше.',
      'Уникання підсилює страх. Ти вже зробив правильний крок — ти тут.',
      'Ти вже знаєш — це минає.',
    ],
  },
};
```

### Step 2: Replace `src/pages/Support/SessionPage.tsx`

```typescript
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { SCENARIOS } from '../../data/scenarios';
import type { ScenarioType } from '../../data/scenarios';

const RATING_OPTIONS = [
  { score: 1, emoji: '😟', label: 'Дуже погано' },
  { score: 2, emoji: '😕', label: 'Погано' },
  { score: 3, emoji: '😐', label: 'Нейтрально' },
  { score: 4, emoji: '🙂', label: 'Краще' },
  { score: 5, emoji: '😌', label: 'Значно краще' },
];

type Phase = 'session' | 'rating' | 'done';

export function SessionPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('session');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const scenario = SCENARIOS[type as ScenarioType];

  if (!scenario) {
    navigate('/support', { replace: true });
    return null;
  }

  const currentPhrase = scenario.phrases[phraseIndex];
  const isLastPhrase = phraseIndex === scenario.phrases.length - 1;
  const progress = Math.round(((phraseIndex + 1) / scenario.phrases.length) * 100);

  function handleNext() {
    if (isLastPhrase) {
      setPhase('rating');
    } else {
      setPhraseIndex((i) => i + 1);
    }
  }

  function handleRating(score: number) {
    setSelectedRating(score);
    setPhase('done');
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="w-full max-w-md flex flex-col gap-6 items-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-4xl">
              ✓
            </div>
            <h1 className="text-3xl font-black text-white">Добре зроблено</h1>
            <p className="text-white/60 text-base">
              Ти пройшов через це. Кожен раз стає трохи легше.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/support')}>
              Повернутись до підтримки
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'rating') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <div className="w-full max-w-md flex flex-col gap-8 text-center">
            <h2 className="text-2xl font-black text-white">Як ти себе почуваєш?</h2>
            <p className="text-white/50">Порівняно з початком сесії</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => handleRating(opt.score)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 min-w-[60px] ${
                    selectedRating === opt.score
                      ? 'border-[#f5a623] bg-[#f5a623]/10'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-white/50 text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Header + progress */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/support')}
                className="text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                ← Вийти
              </button>
              <span className="text-white/40 text-sm">
                {phraseIndex + 1} / {scenario.phrases.length}
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f5a623] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Phrase card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[180px] flex items-center justify-center">
            <p className="text-white text-xl font-medium text-center leading-relaxed">
              {currentPhrase}
            </p>
          </div>

          {/* Next button */}
          <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
            {isLastPhrase ? 'Завершити' : 'Далі →'}
          </Button>
        </div>
      </main>
    </div>
  );
}
```

### Step 3: Verify in browser

Navigate to `/support/session/panic_wave` (after ensuring selectedProduct.hasSupport is true).
Verify:
- Phrase shown, "Далі →" advances to next phrase
- Progress bar fills
- After last phrase: rating screen with 5 emoji buttons
- After picking rating: done screen with "Повернутись до підтримки"
- Unknown type (e.g. `/support/session/unknown`) → redirects to /support

### Step 4: Commit

```bash
git add src/data/scenarios.ts src/pages/Support/SessionPage.tsx
git commit -m "feat: add /support/session/:type with phrase flow, rating, and completion screens"
```

---

## Task 7: Update ThankYouPage with upsells and /support button

**Files:**
- Modify: `src/pages/ThankYou/ThankYouPage.tsx`

The updated page shows:
1. Success checkmark + "Дякуємо!"
2. If selectedProduct.hasSupport → "Перейти в підтримку" primary button
3. Upsell section: 1-2 upsell products from UPSELL_MAP (shown as horizontal cards with title, price, CTA "Додати")
4. "Повернутись на головну" ghost button

Clicking an upsell CTA sets the product as selectedProduct and navigates to /checkout.

### Step 1: Replace `src/pages/ThankYou/ThankYouPage.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { UPSELL_MAP, getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';
import type { Product } from '../../types/product';

export function ThankYouPage() {
  const navigate = useNavigate();
  const { result, selectedProduct, setSelectedProduct, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const upsellIds = selectedProduct ? (UPSELL_MAP[selectedProduct.id] ?? []) : [];
  const upsellProducts = upsellIds
    .map((id) => getAllProducts().find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 2);

  function handleUpsell(product: Product) {
    setSelectedProduct(product);
    navigate('/checkout');
  }

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
              ? `«${selectedProduct.title}» вже доступний для вас.`
              : 'Ваш запит прийнято.'}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left flex flex-col gap-2">
            <p className="text-white/50 text-xs uppercase tracking-wider">Що далі</p>
            <p className="text-white/80">
              Перевірте свою пошту — там буде посилання для доступу до матеріалів.
            </p>
          </div>

          {/* Go to support if product includes support */}
          {selectedProduct?.hasSupport && (
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/support')}>
              Перейти в підтримку →
            </Button>
          )}

          {/* Upsells */}
          {upsellProducts.length > 0 && (
            <div className="flex flex-col gap-3 text-left">
              <p className="text-white/40 text-xs uppercase tracking-wider text-center">
                Може стати в нагоді
              </p>
              {upsellProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{product.title}</p>
                    <p className="text-white/50 text-sm mt-0.5">{product.description}</p>
                  </div>
                  <button
                    onClick={() => handleUpsell(product)}
                    className="shrink-0 bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    {product.priceLabel}
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Повернутись на головну
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

### Step 2: Verify in browser

Complete quiz → checkout with "Курс від тривоги" (hasSupport=true) → thank-you.
Verify:
- "Перейти в підтримку →" button is shown
- Upsell section shows "Підтримка 7 днів"
- Clicking upsell navigates to /checkout with that product pre-selected

Complete quiz → checkout with "Що робити зараз" (hasSupport=false) → thank-you.
Verify:
- No "Перейти в підтримку" button
- Upsell section shows "Курс від тривоги" and "Аудіо при паніці"

### Step 3: Commit

```bash
git add src/pages/ThankYou/ThankYouPage.tsx
git commit -m "feat: add upsells and support button to thank-you page"
```

---

## Final Verification

After all 7 tasks are complete, verify the full user journey:

1. **Landing → /test**: Click "Почати" on landing page, URL becomes `/test`
2. **Quiz flow**: 10 questions with 3 options (Рідко/Іноді/Часто). Navigate forward/back works.
3. **Result page**: Shows type badge + 2 preview phrases + blurred paywall with "Розблокувати" CTA.
4. **Checkout**: Correct product pre-selected based on anxiety type. LiqPay form works.
5. **Thank-you**: Shows "Перейти в підтримку" if product has support access. Shows 1-2 upsell cards.
6. **Support**: Guard redirects to /checkout if no qualifying product. Shows 3 scenario buttons.
7. **Session**: 3 scenarios work with phrase-by-phrase flow → rating → done screen.

Run TypeScript check one final time:
```bash
npx tsc --noEmit
```
Expected: zero errors.
