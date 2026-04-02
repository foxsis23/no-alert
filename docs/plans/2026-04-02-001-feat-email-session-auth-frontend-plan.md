---
title: "feat: Email-Lookup Session Auth — Frontend"
type: feat
status: active
date: 2026-04-02
origin: docs/brainstorms/2026-04-01-email-lookup-auth-requirements.md
deepened: 2026-04-02
---

# feat: Email-Lookup Session Auth — Frontend

## Overview

Backend endpoint `POST /auth/session` is already implemented and returns `{ session_token, expires_at, productIds[] }`. This plan covers the frontend work: a dedicated Zustand session store, a `createSession` API call, an email-lookup form gating `MyMaterialsPage`, and a small update to `AccessPage` to unify both auth flows under the session model.

## Problem Frame

Покупці можуть відкрити `/my-materials` з нового пристрою або після очищення браузера і побачити порожній список — `purchasedProductIds` зберігається тільки в localStorage. Потрібен механізм відновлення без реєстрації: ввести email → отримати актуальний список покупок із сервера.

## Requirements Trace

- R4. `MyMaterialsPage` перевіряє наявність валідного `session_token`. Якщо відсутній — показує email-форму.
- R5. Після `POST /auth/session` зберігає `session_token` + `productIds` у Zustand (persist до localStorage).
- R6. Зберігає `{ session_token, expires_at }`. Перевірка: `expires_at > now()`. Прострочений — показує форму знову.
- R7. Форма: одне поле email + кнопка. Три стани результату: список матеріалів / "не знайдено" / "помилка мережі".
- R8. `purchasedProductIds` оновлюється з відповіді сервера, а не тільки локально.

## Scope Boundaries

- Тільки frontend — бекенд вже реалізований.
- Без email-верифікації / OTP.
- Без JWT — простий UUID-токен у localStorage.
- `AccessPage` отримує функціональне оновлення (Unit 5): після redemption викликає `POST /auth/session`. Основна token-validation логіка не змінюється.
- Без серверної re-валідації sessionToken при кожному відкритті сторінки — тільки client-side `expires_at > now()` перевірка (MVP).
- Без on-page expiry timer — перевірка тільки при mount / navigate.
- Рефанди вирішуються через replace-mode у email form flow (не в AccessPage flow).
- `quizStore.reset()` замінюється на `resetQuiz()` що зберігає `purchasedProductIds`.

## Context & Research

### Relevant Code and Patterns

- `src/store/quizStore.ts` — Zustand + persist middleware, `partialize` для вибіркового збереження. Паттерн: immutable updates через `set((state) => ({ ...newSlice }))`. **Session state йде в окремий store** (не сюди) щоб уникнути колізії з `reset()`. `reset()` буде замінено на `resetQuiz()` що зберігає `purchasedProductIds`.
- `src/lib/api.ts` + `src/lib/apiClient.ts` — axios із `success`-envelope interceptor. Interceptor вже розгортає `{ success, data }` → повертає `body.data` напряму. `createSession` має використовувати той самий патерн destructuring що і решта функцій: `const { data } = await apiClient.post(...)`.
- `src/lib/queries.ts` — React Query для server state. Сесія — client state (Zustand), не server state.
- `src/pages/MyMaterials/MyMaterialsPage.tsx` — поточна сторінка: `purchasedProductIds` → фільтрує продукти. Потребує session gate + "Use different email" button.
- `src/pages/Access/AccessPage.tsx` — API виклик → `addPurchasedProduct` → navigate. Потребує оновлення: після token redemption викликати `createSession(email)` (await + 3s timeout), потім navigate.
- `src/utils/user.ts` — `saveUserEmail` / `getUserEmail` через localStorage. Використовувати для pre-fill форми.
- `src/components/ui/Button.tsx` — існуючий компонент кнопки.

### Institutional Learnings

- `quiz-store` у localStorage вже існує — нові поля у **окремому** store (`session-store`) не зачіпають наявний ключ.
- `reset()` у quizStore очищає `purchasedProductIds` — замінюємо на `resetQuiz()` що зберігає їх; це запобігає втраті доступу після перепроходження квізу.

## Key Technical Decisions

- **Окремий `sessionStore`, не розширення `quizStore`**: `quizStore.reset()` скидав би session-поля разом з quiz progress. Окремий store ізолює сесію. (see origin: docs/brainstorms/2026-04-01-email-lookup-auth-requirements.md)
- **`setSession` має два режими — merge і replace**:
  - `merge` (AccessPage flow): WayForPay вебхук може бути затриманий — union(local, server) зберігає щойно куплений productId. Використовується лише в AccessPage де addPurchasedProduct вже запустився.
  - `replace` (email form flow): сервер є авторитетним джерелом при свідомій re-аутентифікації. Вирішує рефанди — новий список з сервера замінює старий.
- **`resetQuiz()` замість `reset()` для quiz flow**: новий action в quizStore скидає answers, currentQuestion, result, selectedProductId — але **не** `purchasedProductIds`. Всі місця що викликають `reset()` переходять на `resetQuiz()`.
- **`isSessionValid()` як чиста утиліта, не computed у store**: залежить від поточного часу → не кешується. Не обгортати у `useMemo` (stale closure). Викликати напряму в render body.
- **Email форма всередині `MyMaterialsPage`, не окрема сторінка**: gate на тій самій сторінці (R4). MyMaterialsPage сама не містить session логіки — тільки умовний рендер `<EmailAccessForm>` або списку.
- **Завжди зберігати сесію після `createSession`**, навіть якщо `productIds: []`: replace-mode перепише `purchasedProductIds` сервер-авторитетним списком. MyMaterialsPage показує "Покупок не знайдено" з посиланням на підтримку (сесія є, форма не з'являється знову). Це відповідає Open Questions resolution.
- **AccessPage await createSession з 3s timeout**: navigate тільки після resolve OR timeout. Усуває gate flash на /my-materials. На timeout → navigate anyway (best-effort).
- **`POST /auth/session` повертає 200 + `productIds: []` для невідомого email** (R3 brainstorm): не 404. `not_found` UI = `productIds.length === 0` + replace-mode session збережена. Підтвердити з бекендом перед початком Unit 4.
- **Rate limiting — hard prerequisite**: frontend не шипиться без підтвердження від бекенду що per-IP + per-email throttling у production.

## Open Questions

### Resolved During Planning

- **Де зберігати sessions**: бекенд — окрема таблиця у PostgreSQL. Frontend використовує `session-store` localStorage ключ.
- **Міграція localStorage**: новий `session-store` ключ ← Zustand persist ← initialState. Старий `quiz-store` не зачіпається.
- **`expires_at` формат**: ISO-рядок → `new Date(expires_at) > new Date()`. 30-днова expiry → clock skew не критичний.
- **Authenticated + empty productIds state**: завжди зберігати сесію (replace-mode). MyMaterialsPage показує "Покупок не знайдено" + підтримка. Форма не повторюється.
- **merge vs replace**: merge — AccessPage (webhook delay). Replace — email form (server authoritative). Вирішує рефанди.

### Deferred to Implementation

- Точний URL endpoint: `POST /auth/session` або `/sessions` — узгодити з бекендом.
- snake_case (`session_token`) vs camelCase — перевірити реальну відповідь. Mapper у `createSession` якщо потрібно. Тест повинен покривати це (Unit 3).
- Точне формулювання текстів UI — взяти з R7 brainstorm.
- **Підтвердити перед Unit 4**: бекенд повертає 200 + `productIds: []` для невідомого email (не 404). Якщо 404 — розширити `apiClient` або `createSession` для перехоплення 404 як `not_found` стану.

## High-Level Technical Design

> *Ілюструє задуманий підхід. Directional guidance для review, не специфікація для копіювання.*

```
/access/:token (existing flow, updated)        /my-materials (new gate)
        │                                               │
GET /access?token=...                       isSessionValid(token, expiresAt)?
        │                                               │
{ valid, productId, email }               NO ──→ <EmailAccessForm>
        │                                       POST /auth/session { email }
addPurchasedProduct(productId)                          │
saveUserEmail(email)                        200 { session_token, expires_at, productIds }
        │                                               │
POST /auth/session { email }  ←──── same ──→   setSession(replace) → sessionStore
[await, 3s timeout]                         +  saveUserEmail(email)
        │                                               │
setSession(merge) → sessionStore             re-render → show list OR "no purchases"
saveUserEmail(email)
        │
navigate → /my-materials                   YES ──→ show list (purchasedProductIds from quizStore)
                                                   ["Use different email" → clearSession]
```

AccessPage: merge (webhook delay). Email form: replace (server authoritative for refunds).

## Implementation Units

```
Unit 1 ──→ Unit 2 ──→ Unit 3 ─┬──→ Unit 4 (MyMaterials gate + form + logout)
(types)    (session    (api fn)  └──→ Unit 5 (AccessPage session bridge)
            store +
            resetQuiz)
```

---

- [ ] **Unit 1: Session Types**

**Goal:** Додати TypeScript-типи для `POST /auth/session` request/response.

**Requirements:** R5, R6

**Dependencies:** None

**Files:**
- Modify: `src/types/api.ts`

**Approach:**
- `CreateSessionRequest { email: string }`
- `CreateSessionResponse { session_token: string; expires_at: string; productIds: string[] }` — snake_case за замовчуванням (відповідає існуючому стилю бекенду). Підтвердити при першому API call і оновити типи + mapper якщо camelCase.

**Patterns to follow:**
- Стиль `src/types/api.ts` — plain interfaces.

**Test scenarios:**
- Test expectation: none — pure TypeScript declarations, no runtime behavior.

**Verification:**
- `tsc --noEmit` без помилок.

---

- [ ] **Unit 2: Session Store + quizStore.resetQuiz()**

**Goal:** Створити `sessionStore` з `sessionToken`, `sessionExpiresAt`, `setSession(mode)`, `clearSession`. Додати `resetQuiz()` до `quizStore` що зберігає `purchasedProductIds`. Замінити виклики `reset()` на `resetQuiz()`.

**Requirements:** R5, R6, R8

**Dependencies:** Unit 1

**Files:**
- Create: `src/store/sessionStore.ts` (includes exported `isSessionValid` utility)
- Test: `src/store/sessionStore.test.ts`
- Modify: `src/store/quizStore.ts` (add `resetQuiz()`, deprecate or keep `reset()`)
- Search & update: всі компоненти що викликають `reset()` → `resetQuiz()` (перевірити через grep)

**Approach:**
- `SessionState`: `{ sessionToken: string | null; sessionExpiresAt: string | null }`
- `SessionActions`:
  - `setSession(token, expiresAt, serverProductIds, mode: 'merge' | 'replace')`:
    - `merge`: loop over serverProductIds, call `useQuizStore.getState().addPurchasedProduct(id)` для кожного. Використовує існуючу deduplication логіку quizStore.
    - `replace`: call `useQuizStore.getState().setProductIds(serverProductIds)` (новий action). Зберігає token/expiry незалежно від довжини serverProductIds.
  - `clearSession()` — скидає token/expiry до null. НЕ змінює `purchasedProductIds`.
- `quizStore` зміни:
  - Додати `setProductIds(ids: string[])` action — `set({ purchasedProductIds: ids })`. Використовується replace-mode.
  - Додати `resetQuiz()` — скидає `answers`, `currentQuestion`, `result`, `selectedProductId`. НЕ скидає `purchasedProductIds`.
  - `reset()` зберігти для backward compat (або видалити якщо немає зовнішніх caller).
- `partialize` sessionStore: зберігає `sessionToken`, `sessionExpiresAt`.
- Export `isSessionValid(token: string | null, expiresAt: string | null): boolean` з `sessionStore.ts`. Не обгортати у useMemo — викликати напряму в render.

**Technical design:**
```
// merge mode (AccessPage — webhook delay possible)
setSession(token, exp, ids, 'merge'):
  for each id in ids: quizStore.getState().addPurchasedProduct(id)
  sessionStore.setState({ sessionToken: token, sessionExpiresAt: exp })

// replace mode (email form — server authoritative, handles refunds)
setSession(token, exp, ids, 'replace'):
  quizStore.getState().setProductIds(ids)
  sessionStore.setState({ sessionToken: token, sessionExpiresAt: exp })

resetQuiz():
  quizStore.setState({
    answers: initialAnswers,
    currentQuestion: 0,
    result: null,
    selectedProductId: null
    // purchasedProductIds NOT in this list
  })
```

**Patterns to follow:**
- `quizStore.ts` — persist + partialize pattern.
- `addPurchasedProduct` — existing deduplication used by merge mode.
- Окремий persist ключ `session-store`.

**Test scenarios:**
- Happy path: `setSession('tok', futureDate, ['id1'], 'replace')` → `sessionToken === 'tok'`, `purchasedProductIds === ['id1']`.
- Happy path: `setSession('tok', futureDate, ['id2'], 'merge')` (existing `['id1']`) → `purchasedProductIds === ['id1', 'id2']`.
- Happy path: `isSessionValid('tok', futureDate)` → `true`.
- Edge case: `isSessionValid(null, null)` → `false`.
- Edge case: `isSessionValid('tok', pastDate)` → `false`.
- Edge case: merge deduplication — local `['id-a']`, server `['id-a', 'id-b']` → `['id-a', 'id-b']`.
- Edge case: replace on empty server list — `setSession(tok, exp, [], 'replace')` → `purchasedProductIds === []`, `sessionToken === 'tok'` (session saved).
- Edge case: `clearSession()` → `sessionToken === null`, `purchasedProductIds` unchanged.
- Edge case: `resetQuiz()` → `result === null`, `currentQuestion === 0`, `purchasedProductIds` unchanged.
- Edge case: старий `quiz-store` у localStorage без session полів → `isSessionValid` returns false.
- Lifecycle: `setSession(tok1, future, ['id1'], 'replace')` → `clearSession()` → `setSession(tok2, future, ['id2'], 'merge')` → `purchasedProductIds: ['id1', 'id2']`, `sessionToken: 'tok2'`.

**Verification:**
- `isSessionValid` — всі edge cases пройдені.
- `quiz-store` і `session-store` — різні ключі у localStorage.
- `resetQuiz()` не змінює `purchasedProductIds`.
- replace-mode: після `setSession(..., 'replace')` `purchasedProductIds` === serverIds точно.

---

- [ ] **Unit 3: `createSession` API Function**

**Goal:** Додати `createSession(email: string): Promise<CreateSessionResponse>` до `src/lib/api.ts`. Покрити mapper тестом.

**Requirements:** R5 (frontend)

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/api.ts`
- Test: `src/lib/api.test.ts` (або окремий `createSession.test.ts`)

**Approach:**
- `POST /auth/session` через `apiClient.post<CreateSessionResponse>('/auth/session', { email })`.
- Interceptor вже розгортає envelope → `const { data } = await apiClient.post(...)` дає `CreateSessionResponse` напряму. **Не** використовувати `data.data`.
- Network/5xx → interceptor кидає `Error` → caller обробляє.
- Якщо бекенд повертає snake_case (`session_token`, `expires_at`) і тип очікує camelCase — додати mapper: `return { sessionToken: raw.session_token, expiresAt: raw.expires_at, productIds: raw.productIds }`. Тест покриває маппінг.

**Patterns to follow:**
- `createPayment` у `src/lib/api.ts` — той самий destructuring pattern.

**Test scenarios:**
- Happy path: apiClient.post стаббований → повертає `{ session_token: 'tok', expires_at: '...', productIds: ['id1'] }` → `createSession` повертає об'єкт з правильними полями (перевіряє mapper).
- Edge case: якщо бекенд повертає camelCase — тест адаптовано відповідно.

**Verification:**
- TypeScript компілює. Функція експортована. Mapper тест проходить.

---

- [ ] **Unit 4: `MyMaterialsPage` Gate + `EmailAccessForm` + "Use different email"**

**Goal:** Session gate на `MyMaterialsPage`. Без валідної сесії — email форма. Після `createSession` (replace-mode) — показати матеріали або "no purchases". "Use different email" кнопка для clearSession.

**Requirements:** R4, R5, R6, R7, R8

**Dependencies:** Unit 2, Unit 3

**Files:**
- Modify: `src/pages/MyMaterials/MyMaterialsPage.tsx`
- Create: `src/pages/MyMaterials/EmailAccessForm.tsx`
- Test: `src/pages/MyMaterials/MyMaterialsPage.test.tsx`

**Approach:**

`MyMaterialsPage`:
- Читає `sessionToken`, `sessionExpiresAt` з `useSessionStore`.
- Якщо `!isSessionValid(...)` → рендерить `<EmailAccessForm />`.
- Якщо валідно → показує список або "Покупок не знайдено" (якщо `purchased.length === 0`).
- При valid session + empty list: показати "Покупок не знайдено" + `mailto:info@tryvoga.net` + "Use different email" link.
- "Use different email" кнопка (завжди видима у list-view): викликає `clearSession()` + `setProductIds([])` → форма показується знову.
- Products loading: якщо сесія валідна і `isLoading === true` → spinner (як зараз). Якщо сесія невалідна → одразу форма.

`EmailAccessForm`:
- Controlled email input. Pre-fill з `getUserEmail()` якщо є.
- Стани: `idle | loading | no_purchases | error` (не "not_found" — уточнена семантика: сервер знайшов email, але purchases немає).
- Submit disabled під час `loading` (запобігає double-submit).
- Client-side validate: `email.trim()` + basic format regex → inline помилка без API call.
- **Завжди** виклик `setSession(token, expiresAt, productIds, 'replace')` + `saveUserEmail(email)` коли `createSession` успішний — незалежно від `productIds.length`.
- `productIds.length === 0` → стан `no_purchases` (сесія збережена replace-mode).
- `productIds.length > 0` → re-render показує список матеріалів.
- Error catch → стан `error`.
- `no_purchases` message: "Покупок не знайдено — перевірте email або напишіть нам" + `mailto:info@tryvoga.net`.
- `error` message: "Помилка з'єднання — спробуйте пізніше".

**Patterns to follow:**
- `src/pages/Support/SessionPage.tsx` — phase-based form state.
- `src/pages/MyMaterials/MyMaterialsPage.tsx` — dark theme стиль.
- `src/components/ui/Button.tsx` — submit і "Use different email".
- `src/utils/user.ts` — `getUserEmail()` для pre-fill.

**Test scenarios:**
- Happy path: store не має sessionToken → `<EmailAccessForm>` відображається.
- Happy path: store має валідний sessionToken → форма прихована, список відображається.
- Happy path: email введено → `createSession` повертає `productIds: ['id1']` → `setSession(replace)` → список відображається.
- Happy path: email pre-fill з `getUserEmail()` якщо значення є.
- **Happy path: `createSession` повертає `productIds: []` → `setSession(replace, [])` викликано (сесія збережена) → стан `no_purchases` → повідомлення з email підтримки. Форма НЕ показується при наступному відкритті (сесія валідна).**
- Edge case: sessionToken є, але expires_at у минулому → форма показується.
- Edge case: email не відповідає формату → inline помилка, жодного API call.
- Edge case: double-submit — кнопка disabled під час loading.
- Edge case: "Use different email" → `clearSession()` + `setProductIds([])` → форма показується.
- Error path: `createSession` кидає network error → стан `error`.
- Integration: після `setSession(replace)` → `isSessionValid` → true → list-view без перезавантаження.
- Integration: replace-mode після рефанду — server повертає productIds без refunded id → `purchasedProductIds` оновлено відповідно.

**Verification:**
- `/my-materials` з порожнім localStorage → форма.
- Введення email з покупками → список.
- Введення email без покупок → "no purchases" + підтримка (форма не повторюється при refresh).
- `/my-materials` з валідним `session-store` → одразу список.
- "Use different email" → повертає до форми.
- replace-mode: `purchasedProductIds` після login = serverIds точно.

---

- [ ] **Unit 5: AccessPage Session Bridge**

**Goal:** Після успішного token redemption у `AccessPage`, await `POST /auth/session` (3s timeout) → `setSession(merge)` → navigate. Тоді `/my-materials` gate не блокуватиме юзера.

**Requirements:** R4 (уникнути блокування AccessPage flow), R5

**Dependencies:** Unit 2, Unit 3

**Files:**
- Modify: `src/pages/Access/AccessPage.tsx`

**Approach:**
- Поточний flow: `GET /access?token` → `{ valid, productId, email }` → `addPurchasedProduct(productId)` → navigate.
- Зміна: після `addPurchasedProduct(productId)` і `saveUserEmail(email)`:
  1. **Guard**: якщо `!data.email` — skip `createSession`, navigate одразу.
  2. Await `createSession(email)` з `Promise.race([createSession(email), timeout(3000)])`.
  3. Успіх → `setSession(token, expiresAt, productIds, 'merge')` (merge — addPurchasedProduct вже запустився, тому union завжди непорожній).
  4. Timeout або помилка → navigate anyway (best-effort).
- Navigate відбувається після resolve OR timeout/error.
- **Примітка**: `no_purchases` guard (з Unit 4) навмисно відсутній тут — `addPurchasedProduct` вже запустився до `createSession`, тому merge завжди непорожній для валідного flow. Не копіювати Unit 4 guard сюди.

**Patterns to follow:**
- Існуючий `useEffect` у `src/pages/Access/AccessPage.tsx` — sequential async calls.

**Test scenarios:**
- Happy path: token valid → `addPurchasedProduct` → `createSession` resolves → `setSession(merge)` → navigate → `/my-materials` shows list immediately (no form).
- Edge case: `createSession` fails after valid token → navigate happens anyway → `/my-materials` shows email form (pre-filled via getUserEmail). Не показує error state на AccessPage.
- Edge case: `createSession` exceeds 3s timeout → navigate → same as failure case.
- Edge case: `data.email === undefined` → skip `createSession`, navigate одразу.

**Verification:**
- Після `/access/:token` → `/my-materials` показує список одразу, без email форми.
- Якщо `createSession` падає або timeout → юзер все одно потрапляє на `/my-materials`.
- AccessPage spinner не зависає при slow `createSession` (3s cap).

## System-Wide Impact

- **Interaction graph:**
  - `AccessPage` → `GET /access` → `addPurchasedProduct` + `POST /auth/session` → `setSession(merge)` → `sessionStore` + `quizStore`.
  - `EmailAccessForm` → `POST /auth/session` → `setSession(replace)` → `sessionStore` + `quizStore.setProductIds`.
  - `clearSession` + `setProductIds([])` → logout flow.
- **Error propagation:** `createSession` errors caught at caller level (EmailAccessForm або AccessPage). Не спливають у глобальний error boundary.
- **State lifecycle risks:**
  - `resetQuiz()` зберігає `purchasedProductIds` — quiz retake не руйнує доступ.
  - `setSession(replace)` перезаписує `purchasedProductIds` сервер-авторитетним списком — вирішує рефанди.
  - `setSession(merge)` ніколи не видаляє існуючі productIds — захист від webhook delay.
  - `clearSession()` зберігає `purchasedProductIds` в quizStore — "Use different email" скидає їх явно через `setProductIds([])`.
- **Unchanged invariants:** `addPurchasedProduct` залишається у quizStore для AccessPage merge flow.
- **API surface parity:** Мультисайт через `Host` header — `apiClient` не змінюється.
- **Integration coverage:** replace-mode cross-store write — потребує інтеграційного тесту (Unit 2 test scenario "replace on empty").

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| **HARD PREREQUISITE: Backend rate limiting** на `POST /auth/session` | Frontend не деплоїться без підтвердження per-IP + per-email throttling від бекенду. |
| snake_case (`session_token`) vs camelCase у TypeScript типах | Mapper у `createSession`. Unit 3 тест покриває маппінг. |
| Підтвердити: бекенд повертає 200 + `productIds: []` для невідомого email (не 404) | Перевірити до Unit 4. Якщо 404 — додати 404-handling у `createSession`. |
| WayForPay вебхук затримка в AccessPage flow | merge-mode у Unit 5. Webhook зазвичай завершується за хвилини. Якщо > 1 год — server-side fix (out of scope). |
| `createSession` slow в AccessPage → юзер чекає | 3s timeout fallback. Приймаємо latency vs gate flash trade-off. |
| XSS + session token у localStorage + no revocation MVP | Задокументовано. CSP headers потрібні на всіх сторінках. Fast-follow: server-side revocation endpoint для support команди. |
| Рефанд: replace-mode при email re-auth перезаписує список | Вирішено через replace-mode. Зазначити у release notes. |
| Shared computer: 30-day session | "Use different email" дозволяє logout з UI. |

## Documentation / Operational Notes

- Новий localStorage ключ `session-store` — не конфліктує з `quiz-store`.
- `tryvoga_email` ключ (`user.ts`) залишається для pre-fill, не для auth.
- `session_token` — UUID, не JWT. Серверна revocation не реалізована в MVP — fast-follow task.
- `setSession` mode: `merge` = AccessPage, `replace` = email form. Задокументувати у sessionStore JSDoc.
- `resetQuiz()` vs `reset()`: `resetQuiz()` для нормального quiz retake (зберігає purchases). `reset()` для повного factory reset якщо колись потрібно.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-01-email-lookup-auth-requirements.md](docs/brainstorms/2026-04-01-email-lookup-auth-requirements.md)
- Backend repo: `github.com/foxsis23/no-sites-api`
- Related code: `src/store/quizStore.ts`, `src/lib/api.ts`, `src/pages/MyMaterials/MyMaterialsPage.tsx`, `src/pages/Access/AccessPage.tsx`, `src/utils/user.ts`
