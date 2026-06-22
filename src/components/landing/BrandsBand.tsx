import { Link } from "@tanstack/react-router";
import brandsCar from "@/assets/brands-car.png";

export function BrandsBand() {
  return (
    <section className="relative py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-5 py-8 text-primary-foreground sm:px-6 sm:py-10 md:px-12">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">— Car Brands —</p>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl">Explore Our Premium Brands</h3>
              <Link
                to="/cars"
                className="mt-6 inline-block rounded-md bg-foreground px-5 py-2 text-sm font-bold uppercase tracking-wider text-background transition hover:bg-background hover:text-foreground"
              >
                View all brands
              </Link>
            </div>
          </div>
          <img
            src={brandsCar}
            alt="Premium car"
            loading="lazy"
            className="pointer-events-none absolute right-2 top-1/2 hidden w-[55%] max-w-[640px] -translate-y-1/2 object-contain md:block"
          />
        </div>
      </div>
    </section>
  );
}