import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Account —</p>
          <h1 className="mt-2 font-display text-4xl">Hi {user?.email}</h1>
        </div>
        <div className="flex gap-2">
          {isStaff && <Link to="/admin" className="rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background">Garage</Link>}
          <button onClick={signOut} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Sign out</button>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl">My bookings</h2>
      <div className="mt-4 space-y-3">
        {!bookings?.length && <p className="text-sm text-foreground/60">No bookings yet. <Link to="/cars" className="text-primary">Browse the fleet →</Link></p>}
        {bookings?.map((b: any) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            {b.vehicles?.primary_image_url && (
              <img src={b.vehicles.primary_image_url} alt="" className="h-16 w-24 rounded-md object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold">{b.vehicles?.name ?? "Vehicle"}</p>
              <p className="text-xs text-foreground/60">{new Date(b.pickup_at).toLocaleString()} → {new Date(b.return_at).toLocaleString()}</p>
              <p className="text-xs text-foreground/60">{b.pickup_location} → {b.dropoff_location}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-primary">${Number(b.total_price).toFixed(0)}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase">{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}