import { createFileRoute } from "@tanstack/react-router";
import { CarFront, Tag, Settings, MapPin, ShieldCheck, Headphones } from "lucide-react";

const SERVICES = [
  { icon: CarFront, title: "Daily & weekly rentals", body: "Flexible terms from a single day to several months." },
  { icon: Tag, title: "Car sales", body: "Pre-owned and new vehicles, inspected and certified." },
  { icon: Settings, title: "Fleet maintenance", body: "Every car serviced before every trip." },
  { icon: MapPin, title: "Free pickup & delivery", body: "We bring the car to you, anywhere in the city." },
  { icon: ShieldCheck, title: "Comprehensive insurance", body: "Drive with peace of mind." },
  { icon: Headphones, title: "24/7 support", body: "Real humans, day or night." },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — GoCar" },
      { name: "description", content: "Daily rentals, car sales, fleet maintenance, free pickup, insurance and 24/7 support — all from GoCar." },
      { property: "og:title", content: "Services — GoCar" },
      { property: "og:description", content: "Everything you need to rent or buy a vehicle, in one place." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Services —</p>
        <h1 className="mt-2 font-display text-5xl">Everything mobility, sorted.</h1>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="rounded-3xl bg-muted p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{s.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  ),
});