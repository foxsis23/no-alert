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
