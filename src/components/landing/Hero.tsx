import { useState } from "react";
import { Car, Bus, Truck as TruckIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TABS = [
  { id: "car", label: "Car", icon: Car },
  { id: "van", label: "Van", icon: Bus },
  { id: "minibus", label: "Minibus", icon: Bus },
  { id: "coupe", label: "Coupe", icon: Car },
  { id: "truck", label: "Truck", icon: TruckIcon },
] as const;

const GH_CITIES = ["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast", "Tema", "Ho", "Sunyani", "Koforidua"];

export function Hero() {
  const [tab, setTab] = useState<string>("car");
  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:py-12 md:px-8 lg:grid-cols-2 lg:gap-4 lg:py-16">
        <div className="relative z-10 min-w-0 space-y-6">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-8 bg-primary" /> Premium
          </div>
          <h1 className="font-display text-4xl leading-[0.95] tracking-wide sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white">Rent</span>{" "}
            <span className="text-white/40">or</span>{" "}
            <span className="text-primary">Buy</span>
          </h1>
          <p className="max-w-md text-sm text-white/70 sm:text-base">
            Self-drive rentals across Ghana. Pick up at the door, drop off
            anywhere, drive away with confidence.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl bg-background text-foreground shadow-2xl">
            <div className="px-5 pt-5">
              <p className="text-sm font-bold">Available For Self-Drive Rent</p>
            </div>
            <div className="mt-3 flex overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    type="button"
                    className={`relative flex min-w-20 shrink-0 flex-1 flex-col items-center gap-1 rounded-t-xl px-3 py-3 text-xs font-bold uppercase transition ${
                      active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <form
              className="space-y-4 border-t border-border bg-background p-5"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.assign(`/cars?type=${tab}`);
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Class">
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue="">
                    <option value="">Any class</option>
                    <option>Economy</option>
                    <option>Premium</option>
                    <option>Luxury</option>
                    <option>SUV</option>
                  </select>
                </Field>
                <Field label="Pick up city">
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue="Accra">
                    {GH_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Drop off city">
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue="Accra">
                    {GH_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Pick up date">
                  <input type="date" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </Field>
                <Field label="Return date">
                  <input type="date" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </Field>
              </div>
              <p className="text-center text-[11px] uppercase tracking-widest text-foreground/50">
                Self-drive · Valid driver's licence & KYC required
              </p>
              <div className="flex justify-center pt-2">
                <button className="rounded-md bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wider text-background transition hover:bg-primary">
                  Find a vehicle
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-4 select-none font-display text-[6rem] leading-none tracking-wider text-primary/30 sm:top-10 sm:text-[12rem] lg:text-[16rem]">
            GOCAR
          </div>
          <div className="absolute right-2 top-2 z-10 rounded-xl bg-black/80 px-3 py-2 text-right text-white shadow-xl sm:right-4 sm:top-32 sm:px-5 sm:py-3">
            <p className="text-[10px] uppercase tracking-widest text-white/60 sm:text-xs">Premium</p>
            <p className="font-display text-xl text-primary sm:text-3xl">GH₵ 800<span className="text-xs text-white sm:text-sm">/day</span></p>
          </div>
          <Link
            to="/cars"
            className="absolute bottom-4 left-4 z-20 rounded-md bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            Browse fleet
          </Link>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      {children}
    </label>
  );
}