import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-10">
            ← Назад
          </Link>

          <h1 className="text-3xl font-black text-center mb-1">МЕДИЧНЕ ЗАСТЕРЕЖЕННЯ</h1>
          <p className="text-white/40 text-sm text-center mb-10">тривога.net</p>

          <div className="flex flex-col gap-6 text-white/70 leading-relaxed">

            <div className="bg-[#e53e3e]/10 border border-[#e53e3e]/30 rounded-2xl p-5">
              <p className="text-white font-semibold mb-2">Важливо прочитати перед використанням сервісу</p>
              <p className="text-white/70 text-sm">Тривога.net надає виключно інформаційно-освітні матеріали. Цей сервіс не є медичним закладом і не надає медичну допомогу.</p>
            </div>

            <section>
              <h2 className="font-bold text-white mb-2">1. Не є медичним діагнозом</h2>
              <p>Результати тесту на тривогу визначають домінуючий тип тривожної реакції на основі ваших відповідей. Це не є медичним діагнозом, не замінює консультацію лікаря, психіатра або психолога і не може використовуватись як підстава для самолікування.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">2. Не замінює професійну допомогу</h2>
              <p className="mb-2">Матеріали сервісу не замінюють:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-4">
                <li>Консультацію психіатра або невролога</li>
                <li>Психотерапію (КПТ, EMDR та інші методи)</li>
                <li>Медикаментозне лікування за призначенням лікаря</li>
                <li>Стаціонарне або амбулаторне лікування</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">3. Зверніться за допомогою негайно, якщо:</h2>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-4 text-white/80">
                <li>У вас є думки про самоушкодження або суїцид</li>
                <li>Ви відчуваєте нездатність функціонувати в повсякденному житті</li>
                <li>Симптоми тривоги різко посилилися або виникли вперше</li>
                <li>Ви приймаєте психотропні препарати без контролю лікаря</li>
              </ul>
              <p className="mt-3">
                <strong className="text-white">Гаряча лінія психологічної підтримки України:</strong> 0 800 505 170 (безкоштовно)
              </p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">4. Для кого призначений сервіс</h2>
              <p>Тривога.net розроблений для людей, які відчувають помірний рівень тривоги та хочуть краще зрозуміти свій стан і навчитись самостійним технікам саморегуляції. Якщо ви маєте встановлений психіатричний діагноз — проконсультуйтесь із лікарем перед використанням матеріалів.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">5. Обмеження відповідальності</h2>
              <p>ТОВ «Фінанс-сервіс» не несе відповідальності за наслідки застосування інформаційних матеріалів сервісу без попередньої консультації з медичним фахівцем.</p>
            </section>

            <section>
              <h2 className="font-bold text-white mb-2">Контакти</h2>
              <p className="mb-1"><strong className="text-white">ТОВ «Фінанс-сервіс»</strong></p>
              <p className="mb-1">Тел.: <a href="tel:+380683493855" className="text-[#f5a623] hover:underline">(068) 349-38-55</a>, <a href="tel:+380958254508" className="text-[#f5a623] hover:underline">(095) 825-45-08</a></p>
              <p>Електронна пошта: <a href="mailto:info@fins.com.ua" className="text-[#f5a623] hover:underline">info@fins.com.ua</a></p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
