import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm text-white/70">
            GoCar gives you premium cars to rent or buy, with zero hassle and
            transparent prices.
          </p>
          <div className="flex gap-3">
            <SocialIcon><Facebook className="h-4 w-4" /></SocialIcon>
            <SocialIcon><Twitter className="h-4 w-4" /></SocialIcon>
            <SocialIcon><Instagram className="h-4 w-4" /></SocialIcon>
          </div>
        </div>
        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/services", label: "Services" },
          { to: "/contact", label: "Contact" },
        ]} />
        <FooterCol title="Inventory" links={[
          { to: "/cars", label: "Rent a car" },
          { to: "/sale", label: "Cars for sale" },
        ]} />
        <div className="space-y-2 text-sm">
          <p className="font-display text-xl tracking-wider text-white">GET IN TOUCH</p>
          <p className="text-white/70">+1 202 102 2525</p>
          <p className="text-white/70">hello@gocar.app</p>
          <p className="text-white/70">123 Drive Lane, Lagos</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} GoCar. All rights reserved.</p>
          <p>Built with care for drivers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="font-display text-xl tracking-wider text-white">{title}</p>
      {links.map((l) => (
        <div key={l.to}>
          <Link to={l.to} className="text-white/70 transition hover:text-primary">{l.label}</Link>
        </div>
      ))}
    </div>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-9 w-9 cursor-pointer place-items-center rounded-md bg-white/10 text-white transition hover:bg-primary">
      {children}
    </span>
  );
}