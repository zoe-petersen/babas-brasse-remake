import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Babas & Brasse" },
      { name: "description", content: "Sign in to the Babas & Brasse editorial admin console." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Babas & Brasse" },
      { property: "og:description", content: "Editorial team access to the Babas & Brasse admin." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-16">
      <div className="w-full max-w-md border-2 border-ink bg-background p-6 hard-shadow sm:p-8">
        <p className="label-xs text-forest-deep">Babas &amp; Brasse</p>
        <h1 className="mt-2 text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Editorial access only. Use your admin credentials.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label-xs">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-2 border-ink bg-background px-3 py-2 text-sm outline-none focus:border-forest"
            />
          </div>
          <div>
            <label htmlFor="password" className="label-xs">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border-2 border-ink bg-background px-3 py-2 text-sm outline-none focus:border-forest"
            />
          </div>

          {error && (
            <p className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="label-xs inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-forest px-5 py-3 text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}