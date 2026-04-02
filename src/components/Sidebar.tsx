import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, History, BrainCircuit, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PulseReadLogo from "@/components/PulseReadLogo";

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
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sticky top-0 z-30 border-b border-border/80 bg-card/65 backdrop-blur-md"
      >
        <div className="mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <PulseReadLogo className="w-10 h-6" />
            <span className="font-sans font-semibold tracking-tight text-foreground text-base leading-tight hidden sm:block">
              PulseRead
            </span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-border mx-1" />

          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <motion.div key={to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <NavLink
                    to={to}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden ml-auto p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="sm:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1"
            >
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active =
                  to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(to);
                return (
                  <motion.div key={to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <NavLink
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </NavLink>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
