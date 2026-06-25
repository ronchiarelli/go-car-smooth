import { useState } from "react";
import { Car, Bus, Truck as TruckIcon, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroCar from "@/assets/hero-car.png";

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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 md:px-8 lg:py-20">
        {/* Background watermark */}
        <div className="pointer-events-none absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 select-none z-0">
          <span className="font-display text-[14rem] font-black leading-none tracking-tighter text-white/[0.03] sm:text-[18rem] lg:text-[22rem]">
            GOCAR
          </span>
        </div>

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left: Content & Form */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl">
                Rent <span className="text-4xl font-medium italic text-white/40 sm:text-5xl lg:text-6xl">or</span>
                <br />
                <span className="text-primary">Buy</span>
              </h1>
              <p className="max-w-md text-base text-white/70 sm:text-lg">
                Self-drive rentals across Ghana. Pick up at the door, drop off anywhere, drive away with confidence.
              </p>
            </div>

            {/* Search form card */}
            <div className="w-full max-w-xl rounded-[2rem] bg-background p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="flex flex-col gap-6">
                <p className="text-sm font-bold text-foreground">Available For Self-Drive Rent</p>

                {/* Vehicle tabs */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        type="button"
                        className={`group flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl px-2 py-3 text-[10px] font-bold uppercase tracking-wider transition ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/50 hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.assign(`/cars?type=${tab}`);
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Class">
                      <select className="w-full rounded-xl border border-border bg-muted px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" defaultValue="">
                        <option value="">Any class</option>
                        <option>Economy</option>
                        <option>Premium</option>
                        <option>Luxury</option>
                        <option>SUV</option>
                      </select>
                    </Field>
                    <Field label="Pick up city">
                      <select className="w-full rounded-xl border border-border bg-muted px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" defaultValue="Accra">
                        {GH_CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Drop off city">
                      <select className="w-full rounded-xl border border-border bg-muted px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" defaultValue="Accra">
                        {GH_CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Pick up date">
                      <input type="date" className="w-full rounded-xl border border-border bg-muted px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                    </Field>
                    <Field label="Return date">
                      <input type="date" className="w-full rounded-xl border border-border bg-muted px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                    </Field>
                  </div>
                  <p className="text-center text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                    Self-drive · Valid driver's licence & KYC required
                  </p>
                  <button className="w-full rounded-2xl bg-foreground py-4 text-sm font-bold uppercase tracking-widest text-background transition hover:bg-primary sm:py-5">
                    Find a vehicle
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Visuals */}
          <div className="relative flex min-h-[420px] flex-col items-center justify-center lg:min-h-[560px] lg:items-end">
            {/* Floating premium badge */}
            <div className="absolute right-0 top-0 z-20 rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white shadow-2xl backdrop-blur-xl sm:right-4 sm:px-6 sm:py-5 lg:-top-6 lg:right-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Premium</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold sm:text-3xl">GH₵ 800</span>
                <span className="text-sm text-white/50">/day</span>
              </div>
            </div>

            {/* Car image with ground shadow */}
            <div className="relative w-full max-w-2xl">
              <img
                src={heroCar}
                alt="Premium BMW convertible"
                width={1280}
                height={640}
                className="relative z-10 w-full object-contain drop-shadow-2xl lg:translate-x-8 lg:scale-105"
              />
              <div className="absolute -bottom-4 left-1/2 z-0 h-10 w-4/5 -translate-x-1/2 rounded-[100%] bg-black/50 blur-2xl sm:h-12" />
            </div>

            {/* Browse fleet CTA */}
            <div className="mt-10 lg:mr-10">
              <Link
                to="/cars"
                className="group inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary transition hover:bg-primary hover:text-primary-foreground sm:px-10 sm:py-5"
              >
                Browse fleet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{label}</span>
      {children}
    </label>
  );
}
