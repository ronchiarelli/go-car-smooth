import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Wrench, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) throw redirect({ to: "/admin" });
  },
  component: AdminUsers,
});

type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: string[];
};

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Row[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pe) throw pe;
      if (re) throw re;
      const byUser = new Map<string, string[]>();
      (roles ?? []).forEach((r: any) => {
        const list = byUser.get(r.user_id) ?? [];
        list.push(r.role);
        byUser.set(r.user_id, list);
      });
      return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser.get(p.id) ?? ["customer"] }));
    },
  });

  async function grant(uid: string, role: "admin" | "fleet_manager") {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) toast.error(error.message);
    else { toast.success(`Granted ${role}`); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
  }
  async function revoke(uid: string, role: "admin" | "fleet_manager") {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
    if (error) toast.error(error.message);
    else { toast.success(`Revoked ${role}`); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
  }

  return (
    <div>
      <h2 className="font-display text-2xl">Users & roles</h2>
      <p className="mt-1 text-sm text-foreground/60">Promote staff to fleet manager or admin. New sign-ups default to customer.</p>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-foreground/60">Loading users…</p>}
        {data?.map((u) => {
          const isAdmin = u.roles.includes("admin");
          const isFleet = u.roles.includes("fleet_manager");
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-foreground/60">
                {isAdmin ? <ShieldCheck className="h-5 w-5 text-primary" /> : isFleet ? <Wrench className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{u.full_name ?? "Unnamed user"}</p>
                <p className="truncate text-xs text-foreground/60">{u.phone ?? "—"} · joined {new Date(u.created_at).toLocaleDateString()}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {u.roles.map((r) => (
                    <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r === "admin" || r === "fleet_manager" ? "bg-primary/15 text-primary" : "bg-muted text-foreground/70"}`}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {isFleet
                  ? <button onClick={() => revoke(u.id, "fleet_manager")} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">Revoke fleet</button>
                  : <button onClick={() => grant(u.id, "fleet_manager")} className="rounded-md bg-foreground px-3 py-1.5 text-xs font-bold text-background hover:bg-primary">Make fleet manager</button>}
                {isAdmin
                  ? <button onClick={() => revoke(u.id, "admin")} className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Revoke admin</button>
                  : <button onClick={() => grant(u.id, "admin")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">Make admin</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}