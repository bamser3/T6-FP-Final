import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary/40 text-xs tracking-widest uppercase mb-2">&gt; system::auth</p>
          <h1 className="text-3xl font-bold glow">TECH<span className="text-primary/40">_</span>EXTRACT</h1>
          <p className="text-primary/50 text-sm mt-2 font-mono">Sign in to your account</p>
        </div>

        <div className="border border-primary/40 bg-black/70 p-8 backdrop-blur-md">
          <h2 className="text-lg font-bold glow mb-6 font-mono">&gt; LOGIN_</h2>

          {error && (
            <div className="mb-5 border border-red-500/60 bg-red-950/30 px-4 py-3 text-red-400 text-sm font-mono">
              [ERROR] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/60 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/60 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-2.5 text-sm uppercase tracking-widest hover:bg-primary/80 transition-colors disabled:opacity-50 font-mono"
            >
              {loading ? "[ AUTHENTICATING... ]" : "[ LOGIN ]"}
            </button>
          </form>
        </div>

        {/* Register prompt */}
        <div className="mt-4 border border-primary/20 bg-black/50 px-6 py-4 text-center font-mono">
          <p className="text-primary/50 text-sm">
            No account yet?{" "}
            <span
              className="text-primary cursor-pointer hover:glow underline"
              onClick={() => setLocation("/register")}
            >
              Create one here &rarr;
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
