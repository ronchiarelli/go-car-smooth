import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GoCar" },
      { name: "description", content: "GoCar is a premium car rental and sale platform with hand-picked vehicles, transparent pricing and free pickup." },
      { property: "og:title", content: "About GoCar" },
      { property: "og:description", content: "Hand-picked vehicles, transparent pricing, free pickup." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— About —</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Built for drivers who hate hassle.</h1>
      <p className="mt-6 text-foreground/70">
        GoCar started with a simple idea: renting or buying a car should feel as good as
        driving one. We curate every vehicle in our fleet, keep prices transparent and
        bring the car to you.
      </p>
      <p className="mt-4 text-foreground/70">
        Our team has spent 12+ years in the mobility industry, working with global rental
        brands and dealerships. Today we serve thousands of customers across major cities.
      </p>
    </section>
  ),
});