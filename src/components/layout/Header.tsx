interface HeaderProps {
  minimal?: boolean;
}

export function Header({ minimal: _minimal = false }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
      <a href="/" className="inline-flex items-baseline gap-0.5">
        <span className="text-white font-black text-xl tracking-tight">тривога</span>
        <span className="text-[#f5a623] font-bold text-xl">.net</span>
      </a>
    </header>
  );
}
