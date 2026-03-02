# тривога.net Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Ukrainian anxiety assessment web app with landing page, 8-question quiz, results, checkout, and thank-you screens.

**Architecture:** React Router SPA with Zustand for quiz state. Each screen is a separate route. Logic is split into pages / UI components / hooks / store / data / types.

**Tech Stack:** React 19, Vite, TypeScript (strict), Tailwind CSS 4, React Router v6, Zustand

---

## Pre-flight

Project is at `/Users/illiastrilets/Projects/no-alert`. Already has React 19 + Vite + TS + Tailwind CSS 4 set up. `node_modules` present. No routing or state management installed yet.

Design reference: `/Users/illiastrilets/Downloads/no-alert.jpg` — dark theme, yellow primary CTA (#f5a623), red accent (#e53e3e), very dark background.

---

### Task 1: Install dependencies + scaffold folder structure

**Files:**
- Modify: `package.json`
- Create: `src/types/quiz.ts`
- Create: `src/types/product.ts`
- Create: `src/store/quizStore.ts` (empty)
- Create: `src/data/questions.ts` (empty)
- Create: `src/data/products.ts` (empty)
- Create: `src/data/anxietyTypes.ts` (empty)

**Step 1: Install react-router-dom and zustand**

```bash
npm install react-router-dom zustand
```

Expected: both packages in `node_modules`, `package.json` updated.

**Step 2: Create folder structure**

```bash
mkdir -p src/components/ui src/components/layout src/pages/Landing/sections src/pages/Quiz src/pages/Results src/pages/Checkout src/pages/ThankYou src/hooks src/store src/data src/types
```

**Step 3: Create `src/types/quiz.ts`**

```ts
export interface QuizQuestion {
  id: number;
  text: string;
}

export interface AnswerOption {
  label: string;
  score: number;
}

export type AnxietyLevel = 'situational' | 'generalized' | 'panic';

export interface AnxietyResult {
  level: AnxietyLevel;
  title: string;
  description: string;
  recommendation: string;
  score: number;
}
```

**Step 4: Create `src/types/product.ts`**

```ts
export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number | null;
  priceLabel: string;
  description: string;
  isHighlighted: boolean;
  imagePlaceholder: string; // bg color for placeholder
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: install router+zustand, scaffold folder structure and types"
```

---

### Task 2: Add quiz data (questions, products, anxiety types)

**Files:**
- Modify: `src/data/questions.ts`
- Modify: `src/data/products.ts`
- Modify: `src/data/anxietyTypes.ts`

**Step 1: Write `src/data/questions.ts`**

```ts
import type { QuizQuestion, AnswerOption } from '../types/quiz';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Ніколи', score: 0 },
  { label: 'Іноді', score: 1 },
  { label: 'Часто', score: 2 },
  { label: 'Завжди', score: 3 },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 1, text: 'Чи відчуваєш ти прискорене серцебиття без видимої причини?' },
  { id: 2, text: 'Чи буває тобі важко дихати або відчуття нестачі повітря?' },
  { id: 3, text: 'Чи боїшся ти втратити контроль над собою або збожеволіти?' },
  { id: 4, text: 'Чи відчуваєш ти нереальність навколишнього світу або власного тіла?' },
  { id: 5, text: 'Чи з\'являється нудота або дискомфорт у шлунку на тлі стресу?' },
  { id: 6, text: 'Чи виникають у тебе раптові напади страху або паніки?' },
  { id: 7, text: 'Чи уникаєш ти певних місць або ситуацій через тривогу?' },
  { id: 8, text: 'Чи заважає тривога твоїй повсякденній діяльності?' },
];
```

**Step 2: Write `src/data/anxietyTypes.ts`**

```ts
import type { AnxietyResult, AnxietyLevel } from '../types/quiz';

export const ANXIETY_RESULTS: Record<AnxietyLevel, Omit<AnxietyResult, 'score'>> = {
  situational: {
    level: 'situational',
    title: 'Ситуативна тривога',
    description:
      'Твій рівень тривоги помірний і, найімовірніше, пов\'язаний з конкретними стресовими ситуаціями. Це нормальна реакція організму на виклики.',
    recommendation:
      'Техніки самодопомоги та базові вправи можуть значно покращити твій стан.',
  },
  generalized: {
    level: 'generalized',
    title: 'Генералізована тривога',
    description:
      'Ти відчуваєш підвищений рівень тривоги, що впливає на різні сфери твого життя. Твій організм перебуває в стані хронічного стресу.',
    recommendation:
      'Рекомендуємо структурований курс із практиками та підтримкою спеціаліста.',
  },
  panic: {
    level: 'panic',
    title: 'Панічний розлад',
    description:
      'Твої симптоми вказують на високий рівень тривоги з ознаками панічних атак. Це виснажливо, але з цим можна ефективно впоратись.',
    recommendation:
      'Рекомендуємо негайну підтримку — персональний супровід фахівця протягом 7 днів.',
  },
};

export function computeAnxietyResult(totalScore: number): AnxietyResult {
  let level: AnxietyLevel;
  if (totalScore <= 8) level = 'situational';
  else if (totalScore <= 16) level = 'generalized';
  else level = 'panic';

  return { ...ANXIETY_RESULTS[level], score: totalScore };
}
```

**Step 3: Write `src/data/products.ts`**

```ts
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
```

**Step 4: Commit**

```bash
git add src/data/ src/types/
git commit -m "feat: add quiz questions, anxiety types scoring, and product data"
```

---

### Task 3: Zustand quiz store

**Files:**
- Modify: `src/store/quizStore.ts`

**Step 1: Write `src/store/quizStore.ts`**

```ts
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
    const total = answers.reduce((sum, a) => sum + (a === -1 ? 0 : a), 0);
    set({ result: computeAnxietyResult(total) });
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  reset: () => set(initialState),
}));
```

**Step 2: Commit**

```bash
git add src/store/quizStore.ts
git commit -m "feat: add Zustand quiz store with answer/navigation/scoring logic"
```

---

### Task 4: Reusable UI components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/ProgressBar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`

**Step 1: Create `src/components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#f5a623] hover:bg-[#e09510] text-black',
    danger: 'bg-[#e53e3e] hover:bg-[#c53030] text-white',
    ghost:
      'bg-transparent border border-white/20 hover:border-white/50 text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Step 2: Create `src/components/ui/ProgressBar.tsx`**

```tsx
interface ProgressBarProps {
  current: number; // 1-based
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-white/60 mb-2">
        <span>Питання {current} з {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#f5a623] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

**Step 3: Create `src/components/layout/Header.tsx`**

```tsx
interface HeaderProps {
  minimal?: boolean;
}

export function Header({ minimal = false }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
      <a href="/" className="inline-flex items-baseline gap-0.5">
        <span className="text-white font-black text-xl tracking-tight">тривога</span>
        <span className="text-[#f5a623] font-bold text-xl">.net</span>
      </a>
      {!minimal && null}
    </header>
  );
}
```

**Step 4: Create `src/components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/40">
        <a href="#" className="hover:text-white/70 transition-colors">
          Політика конфіденційності
        </a>
        <span>|</span>
        <a href="#" className="hover:text-white/70 transition-colors">
          Угода користувача
        </a>
        <span>|</span>
        <span>© тривога.net</span>
        <span>|</span>
        <span>ТОВ "Медичні системи"</span>
      </div>
    </footer>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add Button, ProgressBar, Header, Footer UI components"
```

---

### Task 5: Landing page — Hero section

**Files:**
- Create: `src/pages/Landing/sections/Hero.tsx`

**Step 1: Create `src/pages/Landing/sections/Hero.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0d1a]" />

      {/* Background texture */}
      <div className="absolute inset-0 bg-[#1a1a2e]">
        {/* Simulated atmospheric background */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, #2d3561 0%, #0d0d1a 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
          Накриває?
        </h1>
        <p className="text-xl text-white/70">
          Зараз перевіримо, що це.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/quiz')}
          className="min-w-48 mt-2 text-xl shadow-lg shadow-[#f5a623]/20"
        >
          Почати
        </Button>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/Landing/sections/Hero.tsx
git commit -m "feat: add Hero section with animated CTA"
```

---

### Task 6: Landing page — Symptoms, HowItWorks, Pricing sections

**Files:**
- Create: `src/pages/Landing/sections/Symptoms.tsx`
- Create: `src/pages/Landing/sections/HowItWorks.tsx`
- Create: `src/pages/Landing/sections/Pricing.tsx`

**Step 1: Create `src/pages/Landing/sections/Symptoms.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SYMPTOMS = [
  { icon: '❤️', label: 'Серце б\'ється' },
  { icon: '🫁', label: 'Важко вдихнути' },
  { icon: '😰', label: 'Страх втратити контроль' },
  { icon: '🌫️', label: 'Дереалізація' },
  { icon: '🤢', label: 'Нудота' },
];

export function Symptoms() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10">
          Знайомі відчуття?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {SYMPTOMS.map((symptom) => (
            <div
              key={symptom.label}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-colors"
            >
              <span className="text-3xl">{symptom.icon}</span>
              <span className="text-sm text-white/80 text-center leading-tight">
                {symptom.label}
              </span>
            </div>
          ))}
        </div>

        <Button variant="danger" size="lg" onClick={() => navigate('/quiz')}>
          Перевірити стан
        </Button>
      </div>
    </section>
  );
}
```

**Step 2: Create `src/pages/Landing/sections/HowItWorks.tsx`**

```tsx
const STEPS = [
  {
    icon: '👤',
    label: 'Відповідаєш на питання',
    step: 1,
  },
  {
    icon: '✅',
    label: 'Дізнаєшся свій тип тривоги',
    step: 2,
  },
  {
    icon: '💡',
    label: 'Отримуєш, що робити зараз',
    step: 3,
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Як це працює
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {STEPS.map((step, index) => (
            <div key={step.step} className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <p className="text-sm text-white/70 text-center max-w-[120px]">
                  <span className="text-white/40">{step.step}. </span>
                  {step.label}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="hidden sm:block text-white/30 text-2xl mx-2">→</div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-sm mt-10">
          Це не медпослуга. Не замінює звернення до лікаря.
        </p>
      </div>
    </section>
  );
}
```

**Step 3: Create `src/pages/Landing/sections/Pricing.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../../data/products';

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => navigate('/quiz')}
              className={`relative rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02] cursor-pointer ${
                product.isHighlighted ? 'ring-2 ring-[#e53e3e]' : ''
              }`}
            >
              {/* Image placeholder */}
              <div
                className="w-full h-36"
                style={{ backgroundColor: product.imagePlaceholder }}
              />
              {/* Card content */}
              <div
                className={`p-4 ${
                  product.isHighlighted ? 'bg-[#e53e3e]' : 'bg-[#1a1a2e]'
                }`}
              >
                <p className="font-bold text-white text-base">{product.title}</p>
                <p className={`text-sm mt-1 ${product.isHighlighted ? 'text-white/90' : 'text-[#f5a623]'}`}>
                  {product.priceLabel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Commit**

```bash
git add src/pages/Landing/sections/
git commit -m "feat: add Symptoms, HowItWorks, Pricing landing sections"
```

---

### Task 7: Assemble LandingPage + wire up routing

**Files:**
- Create: `src/pages/Landing/LandingPage.tsx`
- Modify: `src/App.tsx`
- Modify: `index.html`

**Step 1: Create `src/pages/Landing/LandingPage.tsx`**

```tsx
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Hero } from './sections/Hero';
import { Symptoms } from './sections/Symptoms';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <Header />
      <main>
        <Hero />
        <Symptoms />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
```

**Step 2: Update `src/App.tsx` with BrowserRouter + all routes (stub pages for now)**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage';

// Stub pages — will be replaced in following tasks
function QuizPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Quiz coming soon</div>;
}
function ResultsPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Results coming soon</div>;
}
function CheckoutPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Checkout coming soon</div>;
}
function ThankYouPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Thank you!</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Step 3: Update `index.html` title and lang**

```html
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>тривога.net — Перевір свій стан</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 4: Run dev server to verify landing page renders**

```bash
npm run dev
```

Open `http://localhost:5173` — should see landing page with all sections.

**Step 5: Commit**

```bash
git add src/pages/Landing/LandingPage.tsx src/App.tsx index.html
git commit -m "feat: assemble LandingPage and wire up routing with stub pages"
```

---

### Task 8: Quiz page

**Files:**
- Create: `src/pages/Quiz/QuestionCard.tsx`
- Create: `src/pages/Quiz/QuizPage.tsx`
- Create: `src/hooks/useQuiz.ts`
- Modify: `src/App.tsx` (replace QuizPage stub)

**Step 1: Create `src/hooks/useQuiz.ts`**

```ts
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { QUIZ_QUESTIONS } from '../data/questions';

export function useQuiz() {
  const navigate = useNavigate();
  const {
    answers,
    currentQuestion,
    setAnswer,
    nextQuestion,
    prevQuestion,
    computeResult,
  } = useQuizStore();

  const totalQuestions = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const hasAnswer = currentAnswer !== -1;

  function handleAnswer(score: number) {
    setAnswer(currentQuestion, score);
  }

  function handleNext() {
    if (!hasAnswer) return;
    if (isLastQuestion) {
      computeResult();
      navigate('/results');
    } else {
      nextQuestion();
    }
  }

  function handleBack() {
    if (isFirstQuestion) {
      navigate('/');
    } else {
      prevQuestion();
    }
  }

  return {
    question,
    currentQuestion,
    totalQuestions,
    currentAnswer,
    isFirstQuestion,
    isLastQuestion,
    hasAnswer,
    handleAnswer,
    handleNext,
    handleBack,
  };
}
```

**Step 2: Create `src/pages/Quiz/QuestionCard.tsx`**

```tsx
import type { AnswerOption } from '../../types/quiz';

interface QuestionCardProps {
  question: string;
  options: AnswerOption[];
  selectedScore: number;
  onSelect: (score: number) => void;
}

export function QuestionCard({
  question,
  options,
  selectedScore,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-snug">
        {question}
      </h2>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedScore === option.score;
          return (
            <button
              key={option.score}
              onClick={() => onSelect(option.score)}
              className={`w-full py-4 px-6 rounded-xl border text-base font-medium transition-all duration-200 text-left
                ${
                  isSelected
                    ? 'bg-[#f5a623] border-[#f5a623] text-black'
                    : 'bg-white/5 border-white/15 text-white hover:border-[#f5a623]/50 hover:bg-white/10'
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Create `src/pages/Quiz/QuizPage.tsx`**

```tsx
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { QuestionCard } from './QuestionCard';
import { useQuiz } from '../../hooks/useQuiz';
import { ANSWER_OPTIONS } from '../../data/questions';

export function QuizPage() {
  const {
    question,
    currentQuestion,
    totalQuestions,
    currentAnswer,
    isFirstQuestion,
    isLastQuestion,
    hasAnswer,
    handleAnswer,
    handleNext,
    handleBack,
  } = useQuiz();

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header minimal />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <ProgressBar current={currentQuestion + 1} total={totalQuestions} />

          <QuestionCard
            question={question.text}
            options={ANSWER_OPTIONS}
            selectedScore={currentAnswer}
            onSelect={handleAnswer}
          />

          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
              className="flex-1"
            >
              {isFirstQuestion ? 'На головну' : 'Назад'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!hasAnswer}
              className="flex-2 flex-grow"
            >
              {isLastQuestion ? 'Переглянути результат' : 'Далі'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 4: Update `src/App.tsx` — replace QuizPage stub with real import**

Replace the `QuizPage` stub function with:
```tsx
import { QuizPage } from './pages/Quiz/QuizPage';
```
And remove the old `function QuizPage()` stub.

**Step 5: Verify in browser**

Navigate to `http://localhost:5173/quiz` — should see progress bar, question text, 4 answer options. Selecting an answer enables the "Далі" button. Final question navigates to `/results` (stub page for now).

**Step 6: Commit**

```bash
git add src/pages/Quiz/ src/hooks/useQuiz.ts src/App.tsx
git commit -m "feat: implement Quiz page with useQuiz hook, progress bar, question cards"
```

---

### Task 9: Results page

**Files:**
- Create: `src/pages/Results/ResultsPage.tsx`
- Modify: `src/App.tsx` (replace ResultsPage stub)

**Step 1: Create `src/pages/Results/ResultsPage.tsx`**

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';

const LEVEL_COLORS = {
  situational: { badge: 'bg-green-500/20 text-green-400 border-green-500/30', bar: 'bg-green-400' },
  generalized: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-400' },
  panic: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-400' },
};

const MAX_SCORE = 24;

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, reset } = useQuizStore();

  // Guard: if no result, send back to quiz
  useEffect(() => {
    if (!result) navigate('/quiz', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const colors = LEVEL_COLORS[result.level];
  const scorePercent = Math.round((result.score / MAX_SCORE) * 100);

  function handleRestart() {
    reset();
    navigate('/quiz');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header minimal />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8 text-center">
          {/* Badge */}
          <div>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.badge}`}
            >
              Твій результат
            </span>
          </div>

          {/* Anxiety type title */}
          <h1 className="text-4xl font-black text-white">{result.title}</h1>

          {/* Score bar */}
          <div className="flex flex-col gap-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-xs text-white/40">Рівень тривоги: {result.score}/{MAX_SCORE}</p>
          </div>

          {/* Description */}
          <p className="text-white/70 text-base leading-relaxed">
            {result.description}
          </p>

          {/* Recommendation box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Рекомендація</p>
            <p className="text-white/90 text-base">{result.recommendation}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/checkout')}>
              Отримати допомогу
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
              Пройти ще раз
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Update `src/App.tsx` — replace ResultsPage stub**

```tsx
import { ResultsPage } from './pages/Results/ResultsPage';
```
Remove old `function ResultsPage()` stub.

**Step 3: Verify flow end-to-end**

Complete quiz → should land on `/results` showing anxiety type, score bar, description, CTA.

**Step 4: Commit**

```bash
git add src/pages/Results/ResultsPage.tsx src/App.tsx
git commit -m "feat: implement Results page with anxiety type, score bar, and CTAs"
```

---

### Task 10: Checkout page

**Files:**
- Create: `src/pages/Checkout/ProductCard.tsx`
- Create: `src/pages/Checkout/CheckoutPage.tsx`
- Modify: `src/App.tsx` (replace CheckoutPage stub)

**Step 1: Create `src/pages/Checkout/ProductCard.tsx`**

```tsx
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden text-left w-full transition-all duration-200
        ${isSelected ? 'ring-2 ring-[#f5a623] scale-[1.02]' : 'ring-1 ring-white/10 hover:ring-white/30'}
      `}
    >
      {/* Image placeholder */}
      <div
        className="w-full h-28 flex items-center justify-center text-white/20 text-sm"
        style={{ backgroundColor: product.imagePlaceholder }}
      >
        {product.subtitle}
      </div>

      <div className={`p-4 ${product.isHighlighted ? 'bg-[#e53e3e]' : 'bg-[#1a1a2e]'}`}>
        <p className="font-bold text-white text-sm">{product.title}</p>
        <p className={`text-sm mt-1 font-semibold ${product.isHighlighted ? 'text-white' : 'text-[#f5a623]'}`}>
          {product.priceLabel}
        </p>
        <p className="text-xs text-white/50 mt-1 leading-snug">{product.description}</p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-black text-xs font-bold">
          ✓
        </div>
      )}
    </button>
  );
}
```

**Step 2: Create `src/pages/Checkout/CheckoutPage.tsx`**

```tsx
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

  // Auto-select recommended product based on anxiety level
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
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
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

          {/* Product selection */}
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

          {/* Payment form */}
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
```

**Step 3: Update `src/App.tsx` — replace CheckoutPage stub**

```tsx
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
```
Remove old `function CheckoutPage()` stub.

**Step 4: Commit**

```bash
git add src/pages/Checkout/ src/App.tsx
git commit -m "feat: implement Checkout page with product selection and payment form"
```

---

### Task 11: Thank You page + final App.tsx cleanup

**Files:**
- Create: `src/pages/ThankYou/ThankYouPage.tsx`
- Modify: `src/App.tsx` (final cleanup — all real imports)

**Step 1: Create `src/pages/ThankYou/ThankYouPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';

export function ThankYouPage() {
  const navigate = useNavigate();
  const { selectedProduct, reset } = useQuizStore();

  function handleRestart() {
    reset();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header minimal />

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
```

**Step 2: Final `src/App.tsx` — remove all stubs, use real imports**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { ResultsPage } from './pages/Results/ResultsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { ThankYouPage } from './pages/ThankYou/ThankYouPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Step 3: Run full build to check for TypeScript errors**

```bash
npm run build
```

Expected: build succeeds with no errors.

**Step 4: Commit**

```bash
git add src/pages/ThankYou/ src/App.tsx
git commit -m "feat: implement ThankYou page and finalize App routing"
```

---

### Task 12: Polish — animations, global styles, favicon

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

**Step 1: Update `src/index.css` with global styles and smooth scrolling**

```css
@import "tailwindcss";

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0d0d1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0d0d1a;
}
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}
```

**Step 2: Verify full user flow**

1. Open `/` — landing page renders with all sections
2. Click "Почати" — navigates to `/quiz`
3. Answer all 8 questions — navigates to `/results`
4. Click "Отримати допомогу" — navigates to `/checkout`
5. Select product, fill name+email, submit — navigates to `/thank-you`
6. Click "Повернутись на головну" — resets state, back to `/`

**Step 3: Final commit**

```bash
git add src/index.css
git commit -m "feat: add global styles, smooth scrolling, custom scrollbar polish"
```

---

## Done

All 12 tasks complete. The app covers:
- ✅ Landing page matching provided design
- ✅ 8-question quiz with progress bar
- ✅ Anxiety type results with score visualization
- ✅ Checkout with auto-recommended product selection
- ✅ Thank you screen
- ✅ Zustand state management
- ✅ React Router navigation
- ✅ TypeScript strict mode throughout
- ✅ Tailwind CSS 4 styling matching dark design system
