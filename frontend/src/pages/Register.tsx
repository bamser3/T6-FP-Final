import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      setLocation("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md border border-primary/40 bg-black/70 p-8 backdrop-blur-md">
        <h1 className="text-2xl font-bold glow mb-1">&gt; REGISTER_</h1>
        <p className="text-primary/50 text-sm mb-8 font-mono">Create your TechExtract account</p>

        {error && (
          <div className="mb-4 border border-red-500/60 bg-red-950/30 px-4 py-3 text-red-400 text-sm font-mono">
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
              className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/60 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
              placeholder="h4ck3r_name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/60 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
              placeholder="min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/60 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full bg-black border border-primary/40 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary/10 border border-primary text-primary py-2 text-sm uppercase tracking-widest hover:bg-primary/20 transition-colors disabled:opacity-50 font-mono"
          >
            {loading ? "[ CREATING ACCOUNT... ]" : "[ CREATE ACCOUNT ]"}
          </button>
        </form>

        <p className="mt-6 text-center text-primary/40 text-sm font-mono">
          Already have an account?{" "}
          <span
            className="text-primary cursor-pointer hover:glow underline"
            onClick={() => setLocation("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
