import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
      <Link to="/" className="inline-flex items-baseline gap-0.5">
        <span className="text-white font-black text-xl tracking-tight">тривога</span>
        <span className="text-[#f5a623] font-bold text-xl">.net</span>
      </Link>
    </header>
  );
}
