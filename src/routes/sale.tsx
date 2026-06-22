import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Cars for Sale — GoCar" },
      { name: "description", content: "Browse pre-owned and new cars available for purchase from GoCar." },
      { property: "og:title", content: "Cars for Sale — GoCar" },
      { property: "og:description", content: "Quality cars for sale, fully inspected." },
    ],
  }),
  component: SalePage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">No vehicles for sale yet.</div>,
});

function SalePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", "sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .in("listing", ["sale", "both"])
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— For Sale —</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Cars for Sale</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/70 sm:text-base">Inspected, certified, and priced to move. Find your next ride.</p>
      </div>

      {isLoading ? (
        <p className="mt-12 text-center text-sm text-foreground/60">Loading…</p>
      ) : !data?.length ? (
        <p className="mx-auto mt-12 max-w-md rounded-2xl bg-muted p-8 text-center text-sm text-foreground/70">
          No vehicles for sale yet. Check back soon — or browse our <Link to="/cars" className="text-primary">rental fleet</Link>.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((v) => (
            <Link key={v.id} to="/cars/$id" params={{ id: v.id }} className="overflow-hidden rounded-3xl bg-muted transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-56 bg-background">
                {v.primary_image_url ? (
                  <img src={v.primary_image_url} alt={v.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full place-items-center text-foreground/40">No image</div>
                )}
                <div className="absolute bottom-0 right-0 bg-background px-4 py-2">
                  <span className="font-display text-2xl text-primary">${Number(v.sale_price ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1 p-5">
                <h3 className="font-display text-xl">{v.name}</h3>
                <p className="text-xs uppercase tracking-widest text-foreground/60">{v.brand} · {v.year ?? ""} · {v.mileage ? `${v.mileage.toLocaleString()} mi` : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}