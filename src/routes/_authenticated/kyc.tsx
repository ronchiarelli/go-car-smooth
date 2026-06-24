import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ShieldCheck, Upload, FileCheck2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kyc")({
  component: KycPage,
});

const DOC_OPTIONS = [
  { value: "ghana_card", label: "Ghana Card" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
] as const;

function KycPage() {
  const { user } = useAuth();
  const [docType, setDocType] = useState<"ghana_card" | "passport" | "drivers_license">("ghana_card");
  const [docNumber, setDocNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [expiry, setExpiry] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: submissions, refetch } = useQuery({
    queryKey: ["my-kyc", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function uploadOne(file: File, slot: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user!.id}/${Date.now()}-${slot}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!frontFile) { toast.error("Front image is required"); return; }
    setSubmitting(true);
    try {
      const front_url = await uploadOne(frontFile, "front");
      const back_url = backFile ? await uploadOne(backFile, "back") : null;
      const selfie_url = selfieFile ? await uploadOne(selfieFile, "selfie") : null;
      const { error } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        doc_type: docType,
        doc_number: docNumber.trim(),
        full_name: fullName.trim() || null,
        date_of_birth: dob || null,
        expiry_date: expiry || null,
        front_url,
        back_url,
        selfie_url,
      });
      if (error) throw error;
      toast.success("Submitted for review");
      setDocNumber(""); setFullName(""); setDob(""); setExpiry("");
      setFrontFile(null); setBackFile(null); setSelfieFile(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  const latest = submissions?.[0];
  const approved = submissions?.find((s: any) => s.status === "approved");

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Verification —</p>
          <h1 className="font-display text-3xl">KYC Identity</h1>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-foreground/70">
        Verify your identity to rent or sell on GoCar. Upload a clear photo of a
        Ghana Card, Passport, or Driver's License. A driver's licence is
        required to drive any self-drive rental.
      </p>

      {approved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary/10 p-4 text-primary">
          <FileCheck2 className="h-5 w-5" />
          <p className="text-sm font-semibold">Your identity is verified.</p>
        </div>
      )}
      {!approved && latest?.status === "pending" && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-muted p-4">
          <Clock className="h-5 w-5 text-foreground/60" />
          <p className="text-sm">Submission received. Review usually takes under 24 hours.</p>
        </div>
      )}
      {latest?.status === "rejected" && (
        <div className="mt-6 rounded-xl bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2"><XCircle className="h-5 w-5" /><p className="font-semibold">Rejected</p></div>
          {latest.review_notes && <p className="mt-1 text-sm">{latest.review_notes}</p>}
          <p className="mt-1 text-xs">Please re-submit below.</p>
        </div>
      )}

      {!approved && (
        <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Field label="Document type">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {DOC_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document number" required>
              <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder={docType === "ghana_card" ? "GHA-XXXXXXXXX-X" : ""} />
            </Field>
            <Field label="Full name (as on ID)">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </Field>
            <Field label="Date of birth">
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </Field>
            <Field label="Expiry date">
              <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FileField label="Front *" file={frontFile} onChange={setFrontFile} />
            <FileField label="Back" file={backFile} onChange={setBackFile} />
            <FileField label="Selfie holding ID" file={selfieFile} onChange={setSelfieFile} />
          </div>

          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-background transition hover:bg-primary disabled:opacity-60">
            <Upload className="h-4 w-4" /> {submitting ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}

      {!!submissions?.length && (
        <>
          <h2 className="mt-10 font-display text-2xl">History</h2>
          <div className="mt-4 space-y-2">
            {submissions.map((s: any) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold">{labelFor(s.doc_type)} · {s.doc_number}</p>
                  <p className="text-xs text-foreground/60">{new Date(s.created_at).toLocaleString()}</p>
                </div>
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link to="/account" className="font-semibold text-primary">← Back to account</Link>
          </p>
        </>
      )}
    </section>
  );
}

function labelFor(t: string) {
  return DOC_OPTIONS.find((d) => d.value === t)?.label ?? t;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-foreground/70">{label}{required && <span className="text-primary"> *</span>}</span>
      {children}
    </label>
  );
}

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-background px-3 py-6 text-center text-xs hover:bg-muted/50">
        <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] ?? null)} className="hidden" />
        <span className="truncate">{file ? file.name : "Click to upload image"}</span>
      </div>
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "approved" ? "bg-primary/15 text-primary" :
    status === "rejected" ? "bg-destructive/15 text-destructive" :
    "bg-muted text-foreground/70";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>{status}</span>;
}