import { Phone } from "lucide-react";

export function HelpCTA() {
  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-border bg-muted px-6 py-8 text-center sm:px-8 sm:py-10 md:flex-row md:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Need any help?</p>
            <p className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl">+1 202 102 2124</p>
          </div>
          <a
            href="tel:+12021022124"
            className="flex items-center gap-3 rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            <Phone className="h-5 w-5" /> Call 24/7
          </a>
        </div>
      </div>
    </section>
  );
}