import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const isStaff = (roles ?? []).some((r) => r.role === "admin" || r.role === "fleet_manager");
    if (!isStaff) throw redirect({ to: "/account" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl">Garage</h1>
        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 text-sm font-semibold [&::-webkit-scrollbar]:hidden">
          <Link to="/admin" className="rounded-md px-3 py-1.5 hover:bg-muted" activeProps={{ className: "bg-foreground text-background" }} activeOptions={{ exact: true }}>Dashboard</Link>
          <Link to="/admin/vehicles" className="rounded-md px-3 py-1.5 hover:bg-muted" activeProps={{ className: "bg-foreground text-background" }}>Vehicles</Link>
          <Link to="/admin/bookings" className="rounded-md px-3 py-1.5 hover:bg-muted" activeProps={{ className: "bg-foreground text-background" }}>Bookings</Link>
        </nav>
      </div>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}