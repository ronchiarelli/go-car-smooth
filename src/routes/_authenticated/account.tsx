import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CalendarCheck, Wallet, CarFront, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(name, brand, primary_image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["my-purchases", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*, vehicles(name, brand, primary_image_url, sale_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const upcoming = (bookings ?? []).filter((b: any) => new Date(b.pickup_at) >= now && b.status !== "cancelled");
  const active = (bookings ?? []).find((b: any) => b.status === "confirmed" && new Date(b.pickup_at) <= now && new Date(b.return_at) >= now);
  const past = (bookings ?? []).filter((b: any) => new Date(b.return_at) < now || b.status === "cancelled");
  const totalSpent = (bookings ?? [])
    .filter((b: any) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum: number, b: any) => sum + Number(b.total_price ?? 0), 0);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Dashboard —</p>
          <h1 className="mt-2 truncate font-display text-2xl sm:text-4xl">Hi {user?.email}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          {isStaff && <Link to="/admin" className="rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background">Garage</Link>}
          <button onClick={signOut} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Sign out</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={<CalendarCheck className="h-5 w-5" />} label="Total bookings" value={bookings?.length ?? 0} />
        <Stat icon={<CarFront className="h-5 w-5" />} label="Upcoming" value={upcoming.length} />
        <Stat icon={<Wallet className="h-5 w-5" />} label="Total spent" value={`$GH₵ {totalSpent.toFixed(0)}`} />
        <Stat icon={<ShoppingBag className="h-5 w-5" />} label="Buy requests" value={requests?.length ?? 0} />
      </div>

      {/* Active rental banner */}
      {active && (
        <div className="mt-6 overflow-hidden rounded-3xl bg-primary text-primary-foreground">
          <div className="flex flex-wrap items-center gap-5 p-6">
            {active.vehicles?.primary_image_url && (
              <img src={active.vehicles.primary_image_url} alt="" className="h-20 w-28 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Active rental</p>
              <p className="mt-1 truncate font-display text-2xl">{active.vehicles?.name}</p>
              <p className="text-sm opacity-90">Return by {new Date(active.return_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <h2 className="mt-10 font-display text-2xl">Upcoming bookings</h2>
      <div className="mt-4 space-y-3">
        {!upcoming.length && (
          <p className="rounded-2xl bg-muted p-6 text-sm text-foreground/60">
            No upcoming rentals. <Link to="/cars" className="font-semibold text-primary">Browse the fleet →</Link>
          </p>
        )}
        {upcoming.map((b: any) => <BookingRow key={b.id} b={b} />)}
      </div>

      {/* Purchase requests */}
      {!!requests?.length && (
        <>
          <h2 className="mt-10 font-display text-2xl">Purchase requests</h2>
          <div className="mt-4 space-y-3">
            {requests.map((r: any) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                {r.vehicles?.primary_image_url && <img src={r.vehicles.primary_image_url} alt="" className="h-14 w-20 rounded-md object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{r.vehicles?.name}</p>
                  <p className="text-xs text-foreground/60">{r.vehicles?.brand} · Listed GH₵ {Number(r.vehicles?.sale_price ?? 0).toLocaleString()}</p>
                  {r.offer_price && <p className="text-xs text-foreground/60">Your offer: GH₵ {Number(r.offer_price).toLocaleString()}</p>}
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Past */}
      {!!past.length && (
        <>
          <h2 className="mt-10 font-display text-2xl">History</h2>
          <div className="mt-4 space-y-3 opacity-90">
            {past.slice(0, 10).map((b: any) => <BookingRow key={b.id} b={b} />)}
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-muted p-4 sm:p-5">
      <div className="flex items-center gap-2 text-foreground/60">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-3 font-display text-3xl text-primary sm:text-4xl">{value}</p>
    </div>
  );
}

function BookingRow({ b }: { b: any }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
      {b.vehicles?.primary_image_url && (
        <img src={b.vehicles.primary_image_url} alt="" className="h-14 w-20 rounded-md object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{b.vehicles?.name ?? "Vehicle"}</p>
        <p className="text-xs text-foreground/60">{new Date(b.pickup_at).toLocaleDateString()} → {new Date(b.return_at).toLocaleDateString()}</p>
        <p className="truncate text-xs text-foreground/60">{b.pickup_location} → {b.dropoff_location}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-xl text-primary">GH₵ {Number(b.total_price).toFixed(0)}</p>
        <StatusPill status={b.status} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "confirmed" || status === "completed" ? "bg-primary/15 text-primary" :
    status === "cancelled" || status === "rejected" ? "bg-destructive/15 text-destructive" :
    "bg-muted text-foreground/70";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase GH₵ {tone}`}>{status}</span>;
}