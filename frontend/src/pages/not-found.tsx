import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-primary text-6xl font-bold glow">404</p>
      <p className="text-primary/40 text-sm tracking-widest">&gt; TERMINAL_NOT_FOUND</p>
      <Link href="/">
        <span className="text-primary border border-primary/40 px-4 py-2 text-sm hover:bg-primary/10 transition-colors cursor-pointer">[RETURN TO HOME]</span>
      </Link>
    </div>
  );
}
