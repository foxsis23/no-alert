import { Link } from 'react-router-dom';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/40">
        <Link to="/privacy" className="hover:text-white/70 transition-colors">
          Політика конфіденційності
        </Link>
        <span>|</span>
        <Link to="/terms" className="hover:text-white/70 transition-colors">
          Угода користувача
        </Link>
        <span>|</span>
        <Link to="/offer" className="hover:text-white/70 transition-colors">
          Публічна оферта
        </Link>
        <span>|</span>
        <Link to="/disclaimer" className="hover:text-white/70 transition-colors">
          Медичне застереження
        </Link>
        <span>|</span>
        <span>© тривога.net</span>
        <span>ТОВ «Фінанс-сервіс»</span>
        <span>03150, м. Київ, вул. Академіка Вільямса, 6-д, оф. 43</span>
      </div>
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 mt-4">
        <FaCcVisa className="text-white/30 text-4xl" />
        <FaCcMastercard className="text-white/30 text-4xl" />
      </div>
    </footer>
  );
}
