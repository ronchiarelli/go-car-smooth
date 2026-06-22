import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CarFront, CalendarCheck, DollarSign, ShoppingBag, Users, AlertCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { isAdmin } = Route.useRouteContext();

  const { data, isLoading } = useQuery({
    queryKey: ["garage-stats"],
    queryFn: async () => {
      const [vAll, vActive, bAll, prAll, profAll] = await Promise.all([
        supabase.from("vehicles").select("id, listing, daily_price, is_active"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("bookings").select("id, status, total_price, pickup_at, return_at, created_at, pickup_location, dropoff_location, vehicles(name)").order("created_at", { ascending: false }),
        supabase.from("purchase_requests").select("id, status").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        vehiclesTotal: vAll.data?.length ?? 0,
        vehiclesActive: vActive.count ?? 0,
        bookings: bAll.data ?? [],
        purchaseRequests: prAll.data ?? [],
        customerCount: profAll.count ?? 0,
      };
    },
  });

  if (isLoading || !data) return <p className="text-sm text-foreground/60">Loading dashboard…</p>;

  const now = Date.now();
  const bookings = data.bookings as any[];
  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) => b.status === "confirmed" && new Date(b.pickup_at).getTime() <= now && new Date(b.return_at).getTime() >= now);
  const returnsToday = bookings.filter((b) => {
    const r = new Date(b.return_at);
    return r.toDateString() === new Date().toDateString() && (b.status === "confirmed" || b.status === "pending");
  });
  const revenue = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const openRequests = (data.purchaseRequests as any[]).filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={<CarFront className="h-5 w-5" />} label="Vehicles" value={data.vehiclesTotal} sub={`GH₵ {data.vehiclesActive} active`} to="/admin/vehicles" />
        <Stat icon={<Clock className="h-5 w-5" />} label="Active rentals" value={active.length} sub={`GH₵ {returnsToday.length} returns today`} to="/admin/bookings" tone="primary" />
        <Stat icon={<AlertCircle className="h-5 w-5" />} label="Pending approvals" value={pending.length} sub="awaiting review" to="/admin/bookings" tone={pending.length ? "warn" : undefined} />
        {isAdmin ? (
          <Stat icon={<DollarSign className="h-5 w-5" />} label="Revenue" value={`$GH₵ {revenue.toFixed(0)}`} sub="confirmed + completed" />
        ) : (
          <Stat icon={<CalendarCheck className="h-5 w-5" />} label="Total bookings" value={bookings.length} sub="all time" to="/admin/bookings" />
        )}
        {isAdmin && (
          <>
            <Stat icon={<Users className="h-5 w-5" />} label="Customers" value={data.customerCount} sub="registered" to="/admin/users" />
            <Stat icon={<ShoppingBag className="h-5 w-5" />} label="Buy requests" value={openRequests} sub="pending" to="/admin/sales" tone={openRequests ? "warn" : undefined} />
          </>
        )}
      </div>

      {/* Returns due today */}
      {!!returnsToday.length && (
        <Panel title="Returns due today" tone="primary">
          <div className="space-y-2">
            {returnsToday.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-background/40 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{b.vehicles?.name ?? "Vehicle"}</p>
                  <p className="truncate text-xs opacity-70">{b.dropoff_location}</p>
                </div>
                <p className="text-xs font-semibold">{new Date(b.return_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Pending approvals */}
      <Panel title={`Pending approvals (GH₵ {pending.length})`} action={<Link to="/admin/bookings" className="text-xs font-bold uppercase tracking-widest text-primary">Manage →</Link>}>
        {!pending.length ? (
          <p className="text-sm text-foreground/60">Nothing waiting. You're all caught up.</p>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 5).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{b.vehicles?.name ?? "Vehicle"}</p>
                  <p className="text-xs text-foreground/60">{new Date(b.pickup_at).toLocaleDateString()} → {new Date(b.return_at).toLocaleDateString()}</p>
                </div>
                <p className="font-display text-lg text-primary">GH₵ {Number(b.total_price).toFixed(0)}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Recent activity */}
      <Panel title="Recent bookings">
        {!bookings.length ? (
          <p className="text-sm text-foreground/60">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 6).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{b.vehicles?.name}</p>
                  <p className="text-xs text-foreground/60">{b.pickup_location} → {b.dropoff_location}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase GH₵ {
                  b.status === "confirmed" || b.status === "completed" ? "bg-primary/15 text-primary" :
                  b.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                  "bg-muted text-foreground/70"
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Stat({ icon, label, value, sub, to, tone }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; to?: string; tone?: "primary" | "warn" }) {
  const base = "rounded-2xl p-4 sm:p-5 transition";
  const bg =
    tone === "primary" ? "bg-primary text-primary-foreground" :
    tone === "warn" ? "bg-amber-100 text-amber-900" :
    "bg-muted hover:bg-foreground hover:text-background";
  const iconWrap =
    tone === "primary" ? "bg-white/15 text-white" :
    tone === "warn" ? "bg-amber-200 text-amber-900" :
    "bg-primary/10 text-primary";
  const inner = (
    <>
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg GH₵ {iconWrap}`}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
      </div>
      <p className={`mt-3 font-display text-3xl sm:text-4xl GH₵ {tone === "primary" ? "" : "text-primary"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
    </>
  );
  if (to) return <Link to={to} className={`GH₵ {base} GH₵ {bg}`}>{inner}</Link>;
  return <div className={`GH₵ {base} GH₵ {bg}`}>{inner}</div>;
}

function Panel({ title, children, action, tone }: { title: string; children: React.ReactNode; action?: React.ReactNode; tone?: "primary" }) {
  return (
    <div className={`rounded-3xl p-5 sm:p-6 GH₵ {tone === "primary" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-xl">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}