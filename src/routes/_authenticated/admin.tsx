import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  Inbox,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Users,
  Images,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Content", to: "/admin/articles", icon: Newspaper, exact: false },
  { label: "Contributors", to: "/admin/contributors", icon: Users, exact: false },
  { label: "Mood board", to: "/admin/mood-board", icon: Images, exact: false },
  { label: "Moderation", to: "/admin/moderation", icon: MessageSquare, exact: false },
  { label: "Submissions", to: "/admin/submissions", icon: Inbox, exact: false },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-forest text-primary-foreground">
      <div className="flex items-center gap-3 border-b border-primary-foreground/20 px-5 py-5">
        <img src={logo} alt="Babas and Brasse" className="h-8 w-auto" />
        <div className="min-w-0">
          <p className="label-xs">Admin</p>
          <p className="truncate text-xs text-primary-foreground/70">Editorial console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            activeOptions={{ exact: item.exact }}
            className="label-xs flex items-center gap-3 border-2 border-transparent px-3 py-3 transition-colors hover:bg-primary-foreground/10"
            activeProps={{ className: "bg-magenta text-ink border-ink" }}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-primary-foreground/20 p-3">
        <Link
          to="/"
          className="label-xs flex items-center gap-3 px-3 py-3 hover:bg-primary-foreground/10"
        >
          <ArrowUpRight className="h-4 w-4 shrink-0" />
          View site
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="label-xs flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-primary-foreground/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r-2 border-ink lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r-2 border-ink">{sidebar}</div>
        </div>
      )}

      <div className="flex h-full flex-col lg:pl-64">
        <header className="flex items-center gap-3 border-b-2 border-ink bg-background px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="border-2 border-ink p-2"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <p className="label-xs">Babas &amp; Brasse Admin</p>
        </header>

        <main className={cn("flex-1 overflow-y-auto")}>
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}