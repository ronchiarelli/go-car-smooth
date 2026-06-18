import { Link } from "@tanstack/react-router";
import { Armchair, Briefcase, CarFront } from "lucide-react";
import coupe from "@/assets/fleet-coupe.jpg";
import suv from "@/assets/fleet-suv.jpg";
import truck from "@/assets/fleet-truck.jpg";

const FLEET = [
  { id: "demo-coupe", name: "Chevrolet Coupe", img: coupe, price: 120, fuel: "petrol", seats: 4, bags: 2 },
  { id: "demo-suv", name: "Ford White SUV", img: suv, price: 180, fuel: "diesel", seats: 7, bags: 4 },
  { id: "demo-truck", name: "Toyota Crew Cab", img: truck, price: 150, fuel: "petrol", seats: 5, bags: 3 },
];

export function Fleet() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Choose your car —</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Our Vehicle Fleet</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FLEET.map((c) => (
            <article key={c.id} className="overflow-hidden rounded-3xl bg-muted shadow-sm">
              <div className="relative">
                <img src={c.img} alt={c.name} loading="lazy" className="h-64 w-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-background px-5 py-3 text-right">
                  <p className="font-display text-3xl text-primary">${c.price}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">/ Day</p>
                  <Link
                    to="/cars"
                    className="mt-2 inline-block rounded-md bg-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-background transition hover:bg-primary"
                  >
                    Detail
                  </Link>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-display text-2xl">{c.name}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-foreground/70">
                  <Meta icon={<Armchair className="h-4 w-4" />}>{c.seats} Seat</Meta>
                  <Meta icon={<Briefcase className="h-4 w-4" />}>{c.bags} Bags</Meta>
                  <Meta icon={<CarFront className="h-4 w-4" />}>SUV</Meta>
                </div>
                <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wider">
                  <FuelChip active={c.fuel === "petrol"}>Petrol</FuelChip>
                  <FuelChip active={c.fuel === "diesel"}>Diesel</FuelChip>
                  <FuelChip>Electric</FuelChip>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-primary">{icon}</span>
      {children}
    </span>
  );
}

function FuelChip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={active ? "text-primary" : "text-foreground/40 line-through"}>{children}</span>
  );
}