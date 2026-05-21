import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="border-b border-primary/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold glow cursor-pointer hover:text-primary/80 transition-colors">
            {'>'} TechExtract_
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/">
            <span className={`cursor-pointer uppercase text-sm tracking-wider ${location === '/' ? 'text-primary glow border-b-2 border-primary' : 'text-primary/60 hover:text-primary'}`}>
              [01] Extract
            </span>
          </Link>
          <Link href="/browse">
            <span className={`cursor-pointer uppercase text-sm tracking-wider ${location === '/browse' ? 'text-primary glow border-b-2 border-primary' : 'text-primary/60 hover:text-primary'}`}>
              [02] Database
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
