import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const counts = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [v, b, pr] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("purchase_requests").select("id", { count: "exact", head: true }),
      ]);
      return { vehicles: v.count ?? 0, bookings: b.count ?? 0, purchases: pr.count ?? 0 };
    },
  });
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Vehicles" value={counts.data?.vehicles ?? 0} to="/admin/vehicles" />
      <Card title="Bookings" value={counts.data?.bookings ?? 0} to="/admin/bookings" />
      <Card title="Purchase requests" value={counts.data?.purchases ?? 0} to="/admin/bookings" />
    </div>
  );
}

function Card({ title, value, to }: { title: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-3xl bg-muted p-6 transition hover:bg-foreground hover:text-background">
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{title}</p>
      <p className="mt-2 font-display text-5xl text-primary">{value}</p>
    </Link>
  );
}