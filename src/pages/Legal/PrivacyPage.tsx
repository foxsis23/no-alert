import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-10">
            ← Назад
          </Link>

          <h1 className="text-3xl font-black text-center mb-1">ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ</h1>
          <p className="text-white/40 text-sm text-center mb-10">тривога.net</p>

          <div className="flex flex-col gap-6 text-white/70 leading-relaxed">

            <section>
              <h2 className="font-bold text-white mb-2">1. Загальні положення</h2>
              <p className="mb-1">1.1. Ця Політика конфіденційності (далі — Політика) визначає порядок збору, обробки, зберігання та захисту персональних даних Користувачів сайту https://www.тривога.net/ (далі — Сайт).</p>
              <p className="mb-1">1.2. Використовуючи Сайт, Користувач погоджується з умовами цієї Політики та надає згоду на обробку своїх персональних даних відповідно до Закону України «Про захист персональних даних».</p>
              <p>1.3. Власником та розпорядником даних є ТОВ «Фінанс-сервіс» (далі — Адміністрація).</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">2. Яку інформацію ми збираємо</h2>
              <p className="mb-2">Ми можемо збирати та обробляти наступні дані:</p>
              <p className="mb-1">2.1. Дані, які ви надаєте добровільно: ім'я, електронна пошта, номер телефону (якщо ви заповнюєте форми зворотного зв'язку, реєструєтесь або підписуєтесь на розсилку).</p>
              <p>2.2. Дані, що збираються автоматично: IP-адреса, тип браузера, операційна система, дата та час візиту, переглянуті сторінки, файли cookie.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">3. Мета збору та використання даних</h2>
              <p className="mb-2">Ваші дані використовуються для:</p>
              <p className="mb-1">3.1. Надання доступу до функціоналу Сайту.</p>
              <p className="mb-1">3.2. Відповіді на ваші запити, надіслані через форми зворотного зв'язку.</p>
              <p className="mb-1">3.3. Надсилання інформаційних чи новинних дайджестів (якщо ви на це підписались).</p>
              <p className="mb-1">3.4. Покращення роботи Сайту, аналізу трафіку та поведінки користувачів.</p>
              <p>3.5. Забезпечення безпеки та запобігання шахрайству.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">4. Передача даних третім особам</h2>
              <p className="mb-1">4.1. Адміністрація не продає та не передає персональні дані третім особам для маркетингових цілей.</p>
              <p className="mb-2">4.2. Передача даних можлива лише у випадках:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-4">
                <li>Наявності вашої явної згоди.</li>
                <li>Для виконання вимог законодавства України (за запитом правоохоронних органів).</li>
                <li>Для забезпечення роботи Сайту (наприклад, хостинг-провайдерам, сервісам аналітики — Google Analytics тощо), які зобов'язуються зберігати конфіденційність даних.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">5. Захист даних</h2>
              <p className="mb-1">5.1. Адміністрація вживає всіх необхідних організаційних та технічних заходів для захисту персональних даних від несанкціонованого доступу, втрати або розголошення.</p>
              <p>5.2. Передача даних між вами та Сайтом здійснюється з використанням протоколу HTTPS.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">6. Файли cookie</h2>
              <p className="mb-1">6.1. Сайт використовує файли cookie для покращення взаємодії з Користувачем, збереження налаштувань та збору статистики.</p>
              <p>6.2. Продовжуючи використовувати Сайт, ви погоджуєтесь на збереження cookie-файлів на вашому пристрої. Ви можете вимкнути збереження cookie у налаштуваннях вашого браузера.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">7. Ваші права</h2>
              <p className="mb-2">7.1. Ви маєте право в будь-який час:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-4">
                <li>Отримати інформацію про свої персональні дані, які ми зберігаємо.</li>
                <li>Вимагати виправлення або видалення своїх даних.</li>
                <li>Відкликати згоду на обробку даних (наприклад, відписатися від розсилки).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">8. Зміни в Політиці</h2>
              <p>8.1. Адміністрація залишає за собою право оновлювати цю Політику у зв'язку зі змінами в законодавстві або роботі Сайту. Нова редакція Політики набирає чинності з моменту її публікації на цій сторінці.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">9. Контакти</h2>
              <p>Якщо у вас виникли питання щодо цієї Політики, будь ласка, зв'яжіться з нами:</p>
              <p>Електронна пошта: <a href="mailto:info@fins.com.ua" className="text-[#f5a623] hover:underline">info@fins.com.ua</a></p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
