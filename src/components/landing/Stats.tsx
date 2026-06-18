import { CarFront, Users, ShieldCheck, Briefcase } from "lucide-react";

const STATS = [
  { value: "4500+", label: "Clients Served", icon: CarFront },
  { value: "2750+", label: "Happy Customers", icon: Users },
  { value: "600+", label: "Vehicles In Stock", icon: ShieldCheck },
  { value: "12+", label: "Years Experience", icon: Briefcase },
];

export function Stats() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Find your car by brand —</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Wide range of commercial and luxury cars
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="relative overflow-hidden rounded-2xl bg-muted p-6 text-center">
                <span className="absolute left-0 top-0 h-3 w-10 bg-primary" />
                <span className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 bg-primary" />
                <Icon className="mx-auto h-8 w-8 text-foreground/60" />
                <p className="mt-3 font-display text-4xl text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}