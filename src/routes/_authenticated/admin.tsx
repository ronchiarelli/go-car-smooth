import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const list = (roles ?? []).map((r) => r.role);
    const isAdmin = list.includes("admin");
    const isFleet = list.includes("fleet_manager");
    if (!isAdmin && !isFleet) throw redirect({ to: "/account" });
    return { isAdmin, isFleet };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = Route.useRouteContext();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— {isAdmin ? "Admin" : "Fleet Manager"} —</p>
          <h1 className="mt-1 font-display text-3xl">Garage</h1>
        </div>
        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 text-sm font-semibold [&::-webkit-scrollbar]:hidden">
          <NavTab to="/admin" exact>Dashboard</NavTab>
          <NavTab to="/admin/vehicles">Vehicles</NavTab>
          <NavTab to="/admin/bookings">Bookings</NavTab>
          {isAdmin && <NavTab to="/admin/sales">Sales</NavTab>}
          {isAdmin && <NavTab to="/admin/kyc">KYC</NavTab>}
          {isAdmin && <NavTab to="/admin/users">Users</NavTab>}
        </nav>
      </div>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}

function NavTab({ to, exact, children }: { to: string; exact?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="shrink-0 rounded-md px-3 py-1.5 hover:bg-muted"
      activeProps={{ className: "bg-foreground text-background" }}
      activeOptions={{ exact }}
    >
      {children}
    </Link>
  );
}