# тривога.net — Design Document

## Overview

Ukrainian anxiety assessment web app. Users answer a short questionnaire, get their anxiety type, and are offered one of three product tiers.

## Tech Stack

- React 19 + Vite + TypeScript + Tailwind CSS 4
- React Router v6 for navigation
- Zustand for quiz state management
- No UI component library (custom components only)

## Architecture

**Approach: React Router SPA + Zustand**

Each screen is a separate route with clean URL:
- `/` — Landing page
- `/quiz` — Quiz flow
- `/results` — Anxiety type results
- `/checkout` — Product selection + payment form
- `/thank-you` — Confirmation

## Folder Structure

```
src/
├── components/
│   ├── ui/           # Button, Card, ProgressBar, Badge
│   └── layout/       # Header, Footer
├── pages/
│   ├── Landing/      # LandingPage + sections (Hero, Symptoms, HowItWorks, Pricing)
│   ├── Quiz/         # QuizPage + QuestionCard
│   ├── Results/      # ResultsPage + AnxietyTypeCard
│   ├── Checkout/     # CheckoutPage + ProductSelector + PaymentForm
│   └── ThankYou/     # ThankYouPage
├── hooks/
│   └── useQuiz.ts    # Quiz navigation logic
├── store/
│   └── quizStore.ts  # Zustand: answers, currentQuestion, result
├── data/
│   ├── questions.ts  # 8 quiz questions with 4 answer options each
│   ├── products.ts   # 3 product tiers (29 UAH, 149 UAH, 7-day)
│   └── anxietyTypes.ts # 3 anxiety types with descriptions
└── types/
    ├── quiz.ts       # Question, Answer, AnxietyResult
    └── product.ts    # Product type
```

## Screens

### 1. Landing Page
Matches the provided design exactly:
- **Header**: Logo "тривога.net" (bold "тривога" + ".net" in orange/yellow)
- **Hero**: Full-screen dark background with person image, headline "Накриває?", subtitle, yellow CTA "Почати"
- **Symptoms**: "Знайомі відчуття?" — 5 symptom cards (heart racing, hard to breathe, fear of losing control, derealization, nausea), red CTA "Перевірити стан"
- **How It Works**: 3-step process with icons and arrows
- **Pricing**: 3 product cards with photos
- **Footer**: Links + copyright

### 2. Quiz Page
- Progress bar (question X of 8)
- Question text
- 4 answer options as clickable cards (Ніколи=0, Іноді=1, Часто=2, Завжди=3)
- Back/Next navigation
- Animated transitions between questions

### 3. Results Page
- Anxiety type badge + name
- Description of the anxiety type
- Severity indicator
- CTA to select a product

### 4. Checkout Page
- 3 product cards (pre-selects recommended based on result severity)
- Simple payment form (name, email, card fields — UI only, no real payment)
- "Оплатити" button

### 5. Thank You Page
- Success message
- What happens next
- Link back to landing

## State Management

Zustand `quizStore`:
```ts
interface QuizStore {
  answers: number[];           // Score per question (0-3)
  currentQuestion: number;     // Current question index
  result: AnxietyResult | null; // Computed after last question
  selectedProduct: Product | null;
  setAnswer: (index: number, score: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  computeResult: () => void;
  reset: () => void;
}
```

## Scoring Logic

Total score = sum of all answers (0–24 for 8 questions):
- 0–8: Ситуативна тривога (Situational anxiety)
- 9–16: Генералізована тривога (Generalized anxiety)
- 17–24: Панічний розлад (Panic disorder)

## Design System

- Background: `#1a1a2e` / `#0d0d1a` (very dark blue-black)
- Primary CTA: `#f5a623` (yellow/amber)
- Danger/accent: `#e53e3e` (red)
- Text: `#ffffff` / `#e2e8f0`
- Card background: `rgba(255,255,255,0.05)` with border
- Font: System UI / sans-serif (bold headings)

## Quiz Questions

1. Чи відчуваєш ти прискорене серцебиття без причини?
2. Чи буває тобі важко дихати або відчуття нестачі повітря?
3. Чи боїшся ти втратити контроль над собою або збожеволіти?
4. Чи відчуваєш ти нереальність навколишнього світу або свого тіла?
5. Чи з'являється у тебе нудота або дискомфорт у шлунку на тлі стресу?
6. Чи виникають у тебе раптові напади страху або паніки?
7. Чи уникаєш ти певних місць або ситуацій через тривогу?
8. Чи заважає тривога твоїй щоденній діяльності?

Answer options (each): Ніколи (0) / Іноді (1) / Часто (2) / Завжди (3)
