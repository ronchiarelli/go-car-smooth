import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/sales")({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) throw redirect({ to: "/admin" });
  },
  component: AdminSales,
});

function AdminSales() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*, vehicles(name, brand, primary_image_url, sale_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: "pending" | "contacted" | "closed" | "cancelled") {
    const { error } = await supabase.from("purchase_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-sales"] }); }
  }

  return (
    <div>
      <h2 className="font-display text-2xl">Purchase requests</h2>
      <div className="mt-4 space-y-3">
        {!data?.length && <p className="text-sm text-foreground/60">No purchase requests yet.</p>}
        {data?.map((r: any) => (
          <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            {r.vehicles?.primary_image_url && <img src={r.vehicles.primary_image_url} alt="" className="h-16 w-24 rounded-md object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{r.vehicles?.name}</p>
              <p className="text-xs text-foreground/60">Listed GH₵ {Number(r.vehicles?.sale_price ?? 0).toLocaleString()}{r.offer_price ? ` · Offer GH₵ ${Number(r.offer_price).toLocaleString()}` : ""}</p>
              {r.message && <p className="mt-1 line-clamp-2 text-xs text-foreground/70">{r.message}</p>}
            </div>
            <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as any)} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
              {["pending","contacted","closed","cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}