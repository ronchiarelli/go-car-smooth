import { Link } from "@tanstack/react-router";
import { Mail, Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/sale", label: "Buy" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isStaff } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-semibold text-foreground/80 transition hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-4 xl:flex">
          <ContactBadge icon={<Phone className="h-4 w-4" />} label="+1 202 102 2525" />
          <ContactBadge icon={<Mail className="h-4 w-4" />} label="hello@gocar.app" />
          {isAuthenticated ? (
            <Link
              to={isStaff ? "/admin" : "/account"}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background transition hover:bg-primary"
            >
              {isStaff ? "Garage" : "Account"}
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="text-sm font-semibold text-foreground/80 transition hover:text-primary"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background transition hover:bg-primary"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        <button
          aria-label="Toggle menu"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-muted"
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to={isAuthenticated ? (isStaff ? "/admin" : "/account") : "/auth"}
              className="mt-2 rounded-md bg-foreground px-3 py-2 text-center text-sm font-bold text-background"
              onClick={() => setOpen(false)}
            >
              {isAuthenticated ? (isStaff ? "Garage" : "Account") : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function ContactBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}