import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import logoAsset from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In | Babas & Brasse" },
      { name: "description", content: "Sign in to the Babas & Brasse editorial admin console." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In | Babas & Brasse" },
      { property: "og:description", content: "Editorial team access to the Babas & Brasse admin." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh overflow-hidden lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex min-h-64 flex-col overflow-hidden border-b-2 border-ink bg-forest p-5 sm:min-h-80 sm:p-8 lg:min-h-0 lg:border-r-2 lg:border-b-0 lg:p-12">
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 h-40 w-40 rounded-full border-2 border-ink bg-magenta sm:h-56 sm:w-56 lg:-top-16 lg:-right-16"
          />
          <div
            aria-hidden="true"
            className="absolute right-14 bottom-12 h-10 w-10 rotate-12 border-2 border-ink bg-cream sm:right-24 sm:bottom-20 sm:h-16 sm:w-16"
          />

          <div className="relative z-10 flex items-start justify-between">
            <Link to="/" aria-label="Babas and Brasse home" className="inline-flex">
              <img
                src={logoAsset}
                alt="Babas and Brasse"
                width={500}
                height={500}
                className="h-20 w-auto sm:h-24 lg:h-28"
              />
            </Link>
            <span className="label-xs mr-6 border-2 border-ink bg-cream px-3 py-2 sm:mr-20 lg:mr-14">
              Staff only
            </span>
          </div>

          <div className="relative z-10 mt-auto max-w-2xl pt-8 sm:pt-14 lg:pt-20">
            <p className="label-xs inline-flex items-center gap-2">
              <span className="h-2 w-2 bg-magenta" />
              The editorial desk
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl leading-[0.92] sm:text-6xl lg:text-7xl">
              Where the next issue takes shape.
            </h1>
            <p className="mt-5 hidden max-w-lg font-body text-lg leading-relaxed sm:block">
              Sign in to commission stories, shape the conversation and bring the latest edition to
              life.
            </p>

            <div className="mt-8 hidden grid-cols-3 border-t-2 border-ink lg:grid">
              {[
                ["01", "Create"],
                ["02", "Curate"],
                ["03", "Publish"],
              ].map(([number, label]) => (
                <div key={number} className="border-r-2 border-ink py-4 last:border-r-0">
                  <span className="label-xs block text-forest-deep">{number}</span>
                  <span className="mt-1 block font-display text-xl">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="w-full max-w-md">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-magenta shadow-[3px_3px_0_0_var(--ink)]">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="label-xs mt-7 text-forest-deep">Welcome back</p>
            <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Admin sign in</h2>
            <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-muted-foreground">
              Enter your editorial credentials to continue to the admin workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="label-xs">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="editor@example.com"
                  className="mt-2 h-14 w-full border-2 border-ink bg-cream px-4 font-body text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-magenta focus:bg-background"
                />
              </div>

              <div>
                <label htmlFor="password" className="label-xs">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-14 w-full border-2 border-ink bg-cream pr-14 pl-4 font-body text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-magenta focus:bg-background"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 place-items-center border-l-2 border-ink text-ink transition-colors hover:bg-magenta focus-visible:bg-magenta focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="label-xs group inline-flex h-14 w-full items-center justify-center gap-3 border-2 border-ink bg-forest px-5 text-ink shadow-[4px_4px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:bg-magenta hover:shadow-[6px_6px_0_0_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-magenta active:translate-y-0 active:shadow-[2px_2px_0_0_var(--ink)] disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                )}
                {loading ? "Signing in..." : "Enter the newsroom"}
              </button>
            </form>

            <Link
              to="/"
              className="label-xs mt-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to the magazine
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
