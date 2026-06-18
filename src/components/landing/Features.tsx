import { CarFront, Tag, Settings, MapPin } from "lucide-react";
import bike from "@/assets/feature-bike.jpg";

const FEATURES = [
  { icon: CarFront, title: "Deals For Every Budget", body: "Incredible prices on every car, van, bike and package. Book your ride at a price you actually like." },
  { icon: Tag, title: "Flexible Pricing", body: "Daily, weekly and monthly rates with no hidden fees. Cancel free up to 24 hours before pickup." },
  { icon: Settings, title: "Quality At Minimum Expense", body: "Every vehicle is serviced, inspected and detailed before each rental — no surprises." },
  { icon: MapPin, title: "Free Pick-Up & Drop-Off", body: "Enjoy complimentary pickup and drop-off services across major cities, day or night." },
];

export function Features() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Our Features —</p>
          <h2 className="font-display text-4xl md:text-5xl">Why Choose GoCar?</h2>
          <p className="max-w-md text-foreground/70">
            Discover a world of convenience, safety, and customization — paving the way
            for unforgettable adventures and seamless mobility.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4 rounded-2xl bg-muted p-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold">{f.title}</p>
                    <p className="text-sm text-foreground/70">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative">
          <div className="absolute right-4 top-4 h-64 w-64 rounded-3xl bg-primary md:h-80 md:w-80" />
          <img src={bike} alt="Sport motorcycle" loading="lazy" className="relative z-10 mx-auto w-full max-w-md rounded-3xl object-cover" />
        </div>
      </div>
    </section>
  );
}