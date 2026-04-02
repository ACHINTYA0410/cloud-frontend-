import { NavLink, useLocation } from "react-router-dom";
import { Zap, LayoutDashboard, History, BrainCircuit, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/",        label: "Dashboard",  icon: LayoutDashboard },
  { to: "/history", label: "History",    icon: History },
  { to: "/model",   label: "Model Info", icon: BrainCircuit },
];

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* ── Horizontal Navbar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto px-6 h-14 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif font-bold text-foreground text-base leading-tight hidden sm:block">
              Power Monitor
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-border mx-1" />

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Live badge (right side) */}
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Model: Live · AWS
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden ml-auto p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
