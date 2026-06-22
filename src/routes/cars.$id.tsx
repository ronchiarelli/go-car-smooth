import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cars/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Vehicle — GoCar` },
      { name: "description", content: `Book vehicle ${params.id} on GoCar.` },
    ],
  }),
  component: CarDetail,
  errorComponent: ({ error }) => <div className="p-10 text-center text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Vehicle not found.</div>,
});

function CarDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: gallery } = useQuery({
    queryKey: ["vehicle-images", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_images").select("url, sort").eq("vehicle_id", id).order("sort");
      if (error) throw error;
      return data;
    },
  });

  const [active, setActive] = useState(0);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) {
        navigate({ to: "/auth" });
        return;
      }
      const days = Math.max(1, Math.ceil((new Date(returnAt).getTime() - new Date(pickupAt).getTime()) / (1000 * 60 * 60 * 24)));
      const total = Number(vehicle.daily_price ?? 0) * days;
      const { error } = await supabase.from("bookings").insert({
        vehicle_id: vehicle.id,
        user_id: sess.user.id,
        pickup_location: pickup,
        dropoff_location: dropoff,
        pickup_at: pickupAt,
        return_at: returnAt,
        total_price: total,
        notes,
      });
      if (error) throw error;
      toast.success("Booking requested! We'll confirm shortly.");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <div className="p-10 text-center">Loading…</div>;
  if (!vehicle) return <div className="p-10 text-center">Vehicle not found. <Link to="/cars" className="text-primary">Back to fleet</Link></div>;

  const images = [vehicle.primary_image_url, ...(gallery?.map((g) => g.url) ?? [])].filter(Boolean) as string[];
  const hero = images[active] ?? images[0];

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-8 md:py-12 lg:grid-cols-2">
      <div>
        {hero ? (
          <img src={hero} alt={vehicle.name} className="aspect-video w-full rounded-3xl object-cover" />
        ) : (
          <div className="aspect-video w-full rounded-3xl bg-muted" />
        )}
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-lg border-2 transition ${i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={url} alt="" className="aspect-video w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        <h1 className="mt-6 font-display text-3xl sm:text-4xl">{vehicle.name}</h1>
        <p className="text-sm uppercase tracking-widest text-foreground/60">{vehicle.brand} · {vehicle.type} · {vehicle.fuel}</p>
        <p className="mt-4 text-sm text-foreground/70 sm:text-base">{vehicle.description ?? "Premium vehicle, fully serviced and ready for your trip."}</p>
        {vehicle.daily_price != null && (
          <p className="mt-6 font-display text-3xl text-primary">${Number(vehicle.daily_price).toLocaleString()}<span className="ml-1 text-sm text-foreground/60">/day</span></p>
        )}
        {vehicle.sale_price != null && (
          <p className="mt-2 font-display text-2xl text-foreground">${Number(vehicle.sale_price).toLocaleString()}<span className="ml-1 text-sm text-foreground/60">sale price</span></p>
        )}
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-2xl">Book this vehicle</h2>
        <Field label="Pick up location"><input required value={pickup} onChange={(e) => setPickup(e.target.value)} className="input" /></Field>
        <Field label="Drop off location"><input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="input" /></Field>
        <Field label="Pick up date & time"><input required type="datetime-local" value={pickupAt} onChange={(e) => setPickupAt(e.target.value)} className="input" /></Field>
        <Field label="Return date & time"><input required type="datetime-local" value={returnAt} onChange={(e) => setReturnAt(e.target.value)} className="input" /></Field>
        <Field label="Notes (optional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" /></Field>
        <button disabled={busy} className="w-full rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
          {busy ? "Submitting…" : "Request booking"}
        </button>
        <p className="text-center text-xs text-foreground/60">Payment is collected at pickup. You'll get a confirmation email.</p>
      </form>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-background);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem}`}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}