import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  component: AdminKycPage,
});

function AdminKycPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const { data: rows, refetch } = useQuery({
    queryKey: ["admin-kyc", filter],
    queryFn: async () => {
      let q = supabase.from("kyc_documents").select("*, profiles:user_id(full_name, phone)").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  async function signedUrl(path: string | null) {
    if (!path) return null;
    const { data } = await supabase.storage.from("kyc-documents").createSignedUrl(path, 60 * 10);
    return data?.signedUrl ?? null;
  }

  async function review(id: string, status: "approved" | "rejected", notes?: string) {
    const { error } = await supabase
      .from("kyc_documents")
      .update({ status, review_notes: notes ?? null, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">KYC submissions</h2>
        <div className="flex gap-2 text-xs font-semibold">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 uppercase ${filter === f ? "bg-foreground text-background" : "border border-border"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {!rows?.length && <p className="rounded-2xl bg-muted p-6 text-sm text-foreground/60">No {filter === "all" ? "" : filter} submissions.</p>}
        {rows?.map((r: any) => (
          <KycRow key={r.id} row={r} onReview={review} getSignedUrl={signedUrl} />
        ))}
      </div>
    </div>
  );
}

function KycRow({ row, onReview, getSignedUrl }: { row: any; onReview: (id: string, status: "approved" | "rejected", notes?: string) => void; getSignedUrl: (p: string | null) => Promise<string | null> }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(row.review_notes ?? "");
  const [urls, setUrls] = useState<{ front?: string | null; back?: string | null; selfie?: string | null }>({});

  async function load() {
    setOpen(true);
    const [front, back, selfie] = await Promise.all([
      getSignedUrl(row.front_url),
      getSignedUrl(row.back_url),
      getSignedUrl(row.selfie_url),
    ]);
    setUrls({ front, back, selfie });
  }

  const label = row.doc_type === "ghana_card" ? "Ghana Card" : row.doc_type === "passport" ? "Passport" : "Driver's Licence";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">{row.profiles?.full_name ?? "Customer"} · <span className="font-normal text-foreground/70">{label}</span></p>
          <p className="text-xs text-foreground/60">Doc #: {row.doc_number} · {new Date(row.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${row.status === "approved" ? "bg-primary/15 text-primary" : row.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground/70"}`}>{row.status}</span>
          {!open && <button onClick={load} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold">Open</button>}
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Img label="Front" url={urls.front} />
            <Img label="Back" url={urls.back} />
            <Img label="Selfie" url={urls.selfie} />
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">Full name:</span> {row.full_name ?? "—"}</p>
            <p><span className="font-semibold">DOB:</span> {row.date_of_birth ?? "—"}</p>
            <p><span className="font-semibold">Expiry:</span> {row.expiry_date ?? "—"}</p>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Review notes (sent to user on rejection)"
            className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onReview(row.id, "approved", notes)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground">Approve</button>
            <button onClick={() => onReview(row.id, "rejected", notes)}
              className="rounded-md border border-destructive px-4 py-2 text-sm font-bold uppercase text-destructive">Reject</button>
            <button onClick={() => setOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Img({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted">
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60">{label}</div>
      {url ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={label} className="aspect-[4/3] w-full object-cover" /></a>
        : <div className="grid aspect-[4/3] w-full place-items-center text-xs text-foreground/40">Not provided</div>}
    </div>
  );
}