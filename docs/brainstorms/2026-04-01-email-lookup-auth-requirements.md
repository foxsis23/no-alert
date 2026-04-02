---
date: 2026-04-01
topic: email-lookup-auth
---

# Email-Lookup Session Auth

## Problem Frame

Покупці отримують доступ до матеріалів через одноразовий `access_token` у листі. Токен зберігає `productIds` у localStorage. Якщо юзер відкрив з іншого пристрою, очистив браузер або просто загубив лист — доступ втрачено. Потрібен механізм відновлення без email-сервісу і без реєстрації.

Система вже має: `orders.email`, `orders.access_token`, `orders.status`, `AccessPage` (`src/pages/Access/AccessPage.tsx`), `saveUserEmail` у localStorage.

## User Flow

```
Юзер → /my-materials (пусто або без session_token)
  ↓
Форма: "Введіть email, з яким ви купували"
  ↓
POST /auth/session { email }
  ↓
Backend: SELECT product_id FROM orders
         WHERE email = ? AND status = 'success'
  ↓
Повертає: { session_token, productIds[] }
  ↓
localStorage: зберігаємо session_token + productIds
  ↓
/my-materials показує куплені матеріали
```

## Requirements

**Session API**
- R1. Новий endpoint `POST /auth/session` приймає `{ email: string }`. Валідує: email не порожній, має правильний формат — інакше 400. Повертає `{ session_token, expires_at, productIds[] }`.
- R2. `session_token` — UUID. `expires_at` — ISO timestamp (30 днів). Зберігається у новій таблиці `sessions` (не в `orders` — там може бути кілька рядків на один email).
- R3. Якщо email не знайдено або немає успішних orders — повертає `{ productIds: [] }` без помилки (тихий результат). Відповідь має фіксований час обробки щоб уникнути timing oracle.
- R4b. Додати індекс `orders(email)` у міграції Supabase.

**Frontend**
- R4. `MyMaterialsPage` перевіряє наявність валідного `session_token` у localStorage. Якщо відсутній — показує email-форму замість списку покупок.
- R5. Після успішного `POST /auth/session` зберігає `session_token` + `productIds` у Zustand store (persist до localStorage), потім рендерить матеріали.
- R6. Frontend зберігає `{ session_token, expires_at }` у Zustand store. Перевірка: `expires_at > now()`. Якщо прострочений — показує форму знову.
- R7. Форма відновлення доступу — мінімальна: одне поле email + кнопка. Три стани результату: список матеріалів / "Покупок не знайдено — перевірте email або напишіть нам" / "Помилка з'єднання — спробуйте пізніше" (при 5xx/network error).

**Збереження стану між пристроями**
- R8. `purchasedProductIds` у Zustand store оновлюється з відповіді сервера, а не тільки локально — щоб дані були актуальними.

## Success Criteria

- Юзер з будь-якого пристрою може ввести email і отримати доступ до всіх куплених продуктів за один крок.
- Жодного email-сервісу не потрібно.
- Один і той самий механізм працює на всіх 5+ сайтах без додаткового налаштування.

## Scope Boundaries

- Без email-верифікації / OTP — це можна додати пізніше окремим завданням.
- Без реєстрації та паролів.
- Без Supabase Auth — використовуємо власну таблицю sessions або поле в orders.
- Без JWT — простий UUID-токен у localStorage достатній для цього контенту.

## Key Decisions

- **Email як ідентифікатор без верифікації**: прийнятний ризик для цифрового контенту (аудіо/відео курси). Якщо хтось знає чужий email — зможе подивитися куплені матеріали. Для цього продукту це не критично.
- **session_token замість прямого повернення productIds**: дає можливість інвалідувати сесію на сервері, якщо потрібно.
- **Тихий результат для невідомого email** (R3): не підтверджуємо існування email у базі.

## Dependencies / Assumptions

- Backend: **Node.js + TypeScript + Fastify v4 + Prisma ORM + PostgreSQL** (`github.com/foxsis23/no-sites-api`). Мультитенантна архітектура — дані скоуплені по `siteId` через `Host`/`x-forwarded-host` заголовок. `POST /auth/session` автоматично скоупиться на правильний сайт — мультисайт вирішено.
- Supabase таблиця `orders` вже має `email` та `status` колонки — підтверджено (`supabase/schema.sql`). (Примітка: бекенд використовує Prisma + PostgreSQL — можливо окремий інстанс, не Supabase. Уточнити під час планування.)
- Новий endpoint буде реалізований у бекенд-репо, через той самий проксі-шлях.

## Outstanding Questions

### Deferred to Planning

- [Affects R8][Technical] Міграція існуючих юзерів: `quiz-store` у localStorage не має `sessionToken`/`sessionExpiresAt` — стратегія за замовчуванням: null → показати email-форму.
- [Affects R2][Needs research] Уточнити чи бекенд пише `orders` у той самий PostgreSQL що й Supabase schema, чи є окремий інстанс. Визначить де додавати таблицю `sessions`.

## Next Steps

→ `/ce:plan` для структурованого планування реалізації
