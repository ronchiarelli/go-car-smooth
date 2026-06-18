import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

function AdminBookings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(name, brand)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-bookings"] }); }
  }

  return (
    <div>
      <h2 className="font-display text-2xl">All bookings</h2>
      <div className="mt-4 space-y-3">
        {!data?.length && <p className="text-sm text-foreground/60">No bookings yet.</p>}
        {data?.map((b: any) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{b.vehicles?.name ?? "Vehicle"}</p>
              <p className="text-xs text-foreground/60">{new Date(b.pickup_at).toLocaleString()} → {new Date(b.return_at).toLocaleString()}</p>
              <p className="text-xs text-foreground/60">{b.pickup_location} → {b.dropoff_location}</p>
            </div>
            <p className="font-display text-xl text-primary">${Number(b.total_price).toFixed(0)}</p>
            <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value as any)} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
              {["pending","confirmed","cancelled","completed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}