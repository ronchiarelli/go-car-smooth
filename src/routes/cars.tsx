import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Armchair, Briefcase, Fuel } from "lucide-react";

export const Route = createFileRoute("/cars")({
  head: () => ({
    meta: [
      { title: "Rental Fleet — GoCar" },
      { name: "description", content: "Browse the full GoCar rental fleet — cars, SUVs, vans and more." },
      { property: "og:title", content: "Rental Fleet — GoCar" },
      { property: "og:description", content: "Browse our full rental fleet." },
    ],
  }),
  component: CarsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">No vehicles yet.</div>,
});

function CarsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", "rent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .in("listing", ["rent", "both"])
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Available Fleet —</p>
        <h1 className="mt-2 font-display text-5xl">Cars for Rent</h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/70">
          Pick a ride, choose your dates, and we'll handle the rest. Free pickup in major cities.
        </p>
      </div>

      {isLoading ? (
        <p className="mt-12 text-center text-sm text-foreground/60">Loading fleet…</p>
      ) : !data?.length ? (
        <p className="mx-auto mt-12 max-w-md rounded-2xl bg-muted p-8 text-center text-sm text-foreground/70">
          No vehicles in the rental fleet yet. An admin can add inventory from the admin dashboard.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((v) => (
            <Link
              key={v.id}
              to="/cars/$id"
              params={{ id: v.id }}
              className="group overflow-hidden rounded-3xl bg-muted transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 bg-background">
                {v.primary_image_url ? (
                  <img src={v.primary_image_url} alt={v.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full place-items-center text-foreground/40">No image</div>
                )}
                <div className="absolute bottom-0 right-0 bg-background px-4 py-2">
                  <span className="font-display text-2xl text-primary">${Number(v.daily_price ?? 0)}</span>
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-foreground/60">/Day</span>
                </div>
              </div>
              <div className="space-y-2 p-5">
                <h3 className="font-display text-xl">{v.name}</h3>
                <p className="text-xs uppercase tracking-widest text-foreground/60">{v.brand} · {v.type}</p>
                <div className="flex flex-wrap gap-4 text-xs text-foreground/70">
                  <span className="flex items-center gap-1.5"><Armchair className="h-4 w-4 text-primary" /> {v.seats ?? 4} seat</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" /> {v.bags ?? 2} bags</span>
                  <span className="flex items-center gap-1.5"><Fuel className="h-4 w-4 text-primary" /> {v.fuel}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}