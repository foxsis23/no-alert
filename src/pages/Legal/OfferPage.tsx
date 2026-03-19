import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export function OfferPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-10">
            ← Назад
          </Link>

          <h1 className="text-3xl font-black text-center mb-1">ПУБЛІЧНА ОФЕРТА</h1>
          <p className="text-white/40 text-sm text-center mb-10">тривога.net</p>

          <div className="flex flex-col gap-6 text-white/70 leading-relaxed">

            <section>
              <h2 className="font-bold text-white mb-2">1. Загальні положення</h2>
              <p className="mb-1">1.1. Цей документ є публічною офертою ТОВ «Медичні системи» (далі — Виконавець) на надання інформаційно-освітніх послуг через сайт https://www.тривога.net/ (далі — Сайт).</p>
              <p className="mb-1">1.2. Акцептом цієї оферти є факт оплати послуги Замовником. З моменту оплати між Виконавцем і Замовником укладається договір на умовах цієї оферти.</p>
              <p>1.3. Виконавець: ТОВ «Медичні системи», електронна пошта: <a href="mailto:info@tryvoga.net" className="text-[#f5a623] hover:underline">info@tryvoga.net</a></p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">2. Предмет договору</h2>
              <p className="mb-1">2.1. Виконавець зобов'язується надати Замовникові доступ до інформаційно-освітніх матеріалів у сфері психологічного благополуччя (далі — Матеріали).</p>
              <p className="mb-1">2.2. Матеріали можуть включати: текстові описи типів тривоги, рекомендаційні плани дій, аудіозаписи, відеоуроки, PDF-матеріали.</p>
              <p>2.3. Послуги надаються виключно в інформаційно-освітніх цілях і не є медичною допомогою.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">3. Порядок оплати та доступу</h2>
              <p className="mb-1">3.1. Оплата здійснюється через платіжний сервіс LiqPay. Вартість послуг зазначена на Сайті на момент оплати.</p>
              <p className="mb-1">3.2. Доступ до Матеріалів надається одразу після підтвердження оплати шляхом відправки посилання на вказану електронну пошту.</p>
              <p>3.3. Доступ до Матеріалів надається на необмежений строк для особистого використання.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">4. Умови повернення коштів</h2>
              <p className="mb-1">4.1. Замовник має право на повернення коштів протягом 24 годин з моменту оплати, якщо не задоволений якістю Матеріалів.</p>
              <p className="mb-1">4.2. Для повернення необхідно надіслати запит на <a href="mailto:info@tryvoga.net" className="text-[#f5a623] hover:underline">info@tryvoga.net</a> з вказанням замовлення та причини.</p>
              <p>4.3. Повернення здійснюється протягом 3–5 робочих днів на картку, з якої здійснювалась оплата.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">5. Обмеження відповідальності</h2>
              <p className="mb-1">5.1. Матеріали мають виключно інформаційно-освітній характер і не замінюють консультацію лікаря, психіатра або психолога.</p>
              <p className="mb-1">5.2. Виконавець не несе відповідальності за наслідки самостійного застосування Матеріалів без консультації з медичним фахівцем.</p>
              <p>5.3. У разі гострого психічного стану, думок про самоушкодження або суїцид — негайно зверніться до лікаря або за номером екстреної психологічної допомоги.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">6. Права інтелектуальної власності</h2>
              <p>6.1. Всі Матеріали є власністю Виконавця. Копіювання, розповсюдження або комерційне використання без письмової згоди Виконавця заборонено.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">7. Застосовне право</h2>
              <p>7.1. Ця оферта регулюється законодавством України. Всі спори вирішуються шляхом переговорів або в судовому порядку за місцезнаходженням Виконавця.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">8. Контакти</h2>
              <p>Електронна пошта: <a href="mailto:info@tryvoga.net" className="text-[#f5a623] hover:underline">info@tryvoga.net</a></p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
