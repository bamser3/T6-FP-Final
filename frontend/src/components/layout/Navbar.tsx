import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  const linkClass = (path: string) =>
    `cursor-pointer uppercase text-sm tracking-wider transition-colors ${
      location === path
        ? "text-primary glow border-b-2 border-primary pb-0.5"
        : "text-primary/60 hover:text-primary"
    }`;

  return (
    <header className="border-b border-primary/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold glow cursor-pointer hover:text-primary/80 transition-colors">
            {">"} TechExtract_
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/"><span className={linkClass("/")}>[01] Extract</span></Link>
          <Link href="/browse"><span className={linkClass("/browse")}>[02] Database</span></Link>

          {!loading && (
            user ? (
              <button
                onClick={() => setLocation("/profile")}
                className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  location === "/profile"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-primary/40 text-primary/70 hover:border-primary hover:text-primary"
                }`}
              >
                <span className="text-primary/50">▶</span>
                {user.username}
                <span className="text-primary/30 normal-case tracking-normal text-xs">| Edit / Delete</span>
              </button>
            ) : (
              <button
                onClick={() => setLocation("/login")}
                className="border border-primary text-primary px-4 py-1.5 text-xs font-mono uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"
              >
                [ LOGIN ]
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
