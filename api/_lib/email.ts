import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || 'https://тривога.net';

const PRODUCT_TITLES: Record<string, string> = {
  basic: 'Що робити зараз',
  course: 'Курс від тривоги',
  support_7_days: 'Підтримка 7 днів',
  upsell_panic_audio: 'Аудіо при паніці',
  upsell_stability_7days: 'Стабільність 7 днів',
};

export async function sendAccessEmail(email: string, productId: string, accessToken: string) {
  const title = PRODUCT_TITLES[productId] ?? 'Ваш продукт';
  const accessUrl = `${APP_URL}/access/${accessToken}`;

  await resend.emails.send({
    from: 'тривога.net <noreply@tryvoga.net>',
    to: email,
    subject: `Ваш доступ: ${title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0d0d1a; color: #fff; border-radius: 16px;">
        <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 8px;">Дякуємо за покупку!</h1>
        <p style="color: rgba(255,255,255,0.6); margin: 0 0 24px;">${title}</p>

        <a href="${accessUrl}"
           style="display: inline-block; background: #f5a623; color: #000; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 16px;">
          Відкрити матеріали →
        </a>

        <p style="color: rgba(255,255,255,0.3); font-size: 13px; margin: 24px 0 0;">
          Якщо кнопка не працює — перейдіть за посиланням:<br>
          <a href="${accessUrl}" style="color: #f5a623;">${accessUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin: 0;">
          тривога.net · ТОВ «Медичні системи»<br>
          Це не медичний діагноз. Матеріали мають інформаційно-освітній характер.
        </p>
      </div>
    `,
  });
}
