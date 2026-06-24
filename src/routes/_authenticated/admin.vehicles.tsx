import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, EyeOff, ImagePlus, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


export const Route = createFileRoute("/_authenticated/admin/vehicles")({
  component: AdminVehicles,
});

type Form = {
  name: string; brand: string; type: string; listing: string;
  daily_price: string; sale_price: string;
  seats: string; bags: string; fuel: string; transmission: string;
  year: string; mileage: string; description: string; primary_image_url: string;
};

const EMPTY: Form = {
  name: "", brand: "", type: "car", listing: "rent",
  daily_price: "", sale_price: "", seats: "4", bags: "2",
  fuel: "petrol", transmission: "Automatic", year: "", mileage: "",
  description: "", primary_image_url: "",
};

function AdminVehicles() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: string | null;
    mode: "delete" | "deactivate" | null;
  }>({ open: false, id: null, mode: null });
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [editPrimary, setEditPrimary] = useState<string>("");
  const [editGallery, setEditGallery] = useState<{ id?: string; url: string }[]>([]);
  const [editBusy, setEditBusy] = useState(false);
  const [editUploading, setEditUploading] = useState(false);



  async function uploadOne(file: File): Promise<string | null> {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    const { data } = await supabase.storage.from("vehicle-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    return data?.signedUrl ?? null;
  }

  async function openEditImages(v: { id: string; name: string; primary_image_url: string | null }) {
    setEditing({ id: v.id, name: v.name });
    setEditPrimary(v.primary_image_url ?? "");
    const { data: imgs, error } = await supabase
      .from("vehicle_images")
      .select("id,url,sort")
      .eq("vehicle_id", v.id)
      .order("sort", { ascending: true });
    if (error) { toast.error(error.message); setEditGallery([]); return; }
    setEditGallery((imgs ?? []).map((r) => ({ id: r.id as string, url: r.url as string })));
  }

  function closeEdit() {
    setEditing(null);
    setEditPrimary("");
    setEditGallery([]);
  }

  async function editUpload(files: FileList) {
    setEditUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const u = await uploadOne(file);
        if (u) urls.push(u);
      }
      if (!urls.length) return;
      setEditGallery((g) => [...g, ...urls.map((url) => ({ url }))]);
      if (!editPrimary) setEditPrimary(urls[0]);
      toast.success(`Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`);
    } finally {
      setEditUploading(false);
    }
  }

  function makePrimary(url: string) {
    setEditPrimary(url);
  }

  function removeEditImage(url: string) {
    setEditGallery((g) => g.filter((r) => r.url !== url));
    if (editPrimary === url) setEditPrimary("");
  }

  async function saveEditImages() {
    if (!editing) return;
    setEditBusy(true);
    try {
      // Update vehicle's primary image
      const { error: vErr } = await supabase
        .from("vehicles")
        .update({ primary_image_url: editPrimary || null })
        .eq("id", editing.id);
      if (vErr) throw vErr;

      // Replace gallery: delete existing rows, insert current set (excluding primary)
      const { error: dErr } = await supabase.from("vehicle_images").delete().eq("vehicle_id", editing.id);
      if (dErr) throw dErr;

      const galleryUrls = editGallery.map((g) => g.url).filter((u) => u !== editPrimary);
      if (galleryUrls.length) {
        const rows = galleryUrls.map((url, i) => ({ vehicle_id: editing.id, url, sort: i + 1 }));
        const { error: iErr } = await supabase.from("vehicle_images").insert(rows);
        if (iErr) throw iErr;
      }

      toast.success("Images updated");
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      closeEdit();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setEditBusy(false);
    }
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const u = await uploadOne(file);
        if (u) urls.push(u);
      }
      if (!urls.length) return;
      setForm((f) => {
        if (f.primary_image_url) {
          setGallery((g) => [...g, ...urls]);
          return f;
        }
        setGallery((g) => [...g, ...urls.slice(1)]);
        return { ...f, primary_image_url: urls[0] };
      });
      toast.success(`Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    if (form.primary_image_url === url) {
      const next = gallery[0] ?? "";
      setForm((f) => ({ ...f, primary_image_url: next }));
      setGallery((g) => g.slice(1));
    } else {
      setGallery((g) => g.filter((u) => u !== url));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: any = {
        name: form.name, brand: form.brand,
        type: form.type, listing: form.listing,
        daily_price: form.daily_price ? Number(form.daily_price) : null,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        seats: Number(form.seats) || 4, bags: Number(form.bags) || 2,
        fuel: form.fuel, transmission: form.transmission,
        year: form.year ? Number(form.year) : null,
        mileage: form.mileage ? Number(form.mileage) : null,
        description: form.description || null,
        primary_image_url: form.primary_image_url || null,
      };
      const { data: inserted, error } = await supabase.from("vehicles").insert(payload).select("id").single();
      if (error) throw error;
      if (gallery.length && inserted?.id) {
        const rows = gallery.map((url, i) => ({ vehicle_id: inserted.id, url, sort: i + 1 }));
        const { error: gErr } = await supabase.from("vehicle_images").insert(rows);
        if (gErr) toast.error(`Vehicle saved but gallery failed: ${gErr.message}`);
      }
      toast.success("Vehicle added");
      setForm(EMPTY);
      setGallery([]);
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function promptDelete(id: string) {
    setConfirmDialog({ open: true, id, mode: "delete" });
  }

  function promptDeactivate(id: string) {
    setConfirmDialog({ open: true, id, mode: "deactivate" });
  }

  function closeConfirm() {
    setConfirmDialog({ open: false, id: null, mode: null });
  }

  async function executeConfirm() {
    const { id, mode } = confirmDialog;
    if (!id) return;
    if (mode === "delete") {
      // Clean up gallery rows first (CASCADE covers this, but keeps things tidy if FK changes).
      await supabase.from("vehicle_images").delete().eq("vehicle_id", id);
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (!error) {
        toast.success("Vehicle deleted");
        qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
        qc.invalidateQueries({ queryKey: ["vehicles"] });
        closeConfirm();
        return;
      }
      // FK violation — vehicle has bookings or purchase requests.
      if ((error as any).code === "23503") {
        toast.error("This vehicle is tied to bookings or purchase requests, so it can't be deleted.");
        setConfirmDialog({ open: true, id, mode: "deactivate" });
        return;
      }
      toast.error(error.message);
    }
    if (mode === "deactivate") {
      const { error: dErr } = await supabase.from("vehicles").update({ is_active: false }).eq("id", id);
      if (dErr) toast.error(dErr.message);
      else {
        toast.success("Vehicle deactivated");
        qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
        qc.invalidateQueries({ queryKey: ["vehicles"] });
      }
      closeConfirm();
    }
  }


  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="font-display text-2xl">Inventory</h2>
        <div className="mt-4 space-y-3">
          {!data?.length && <p className="text-sm text-foreground/60">No vehicles yet. Add one →</p>}
          {data?.map((v) => (
            <div key={v.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              {v.primary_image_url && <img src={v.primary_image_url} alt="" className="h-16 w-24 rounded-md object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{v.name}</p>
                <p className="text-xs text-foreground/60">{v.brand} · {v.type} · {v.listing}</p>
              </div>
              <div className="text-right text-xs">
                {(v.listing === "rent" || v.listing === "both") && v.daily_price != null && <p>GH₵ {Number(v.daily_price).toLocaleString()}/day</p>}
                {(v.listing === "sale" || v.listing === "both") && v.sale_price != null && <p>GH₵ {Number(v.sale_price).toLocaleString()}</p>}
              </div>
              <button
                onClick={() => openEditImages(v)}
                className="text-foreground/70 hover:text-primary"
                aria-label="Edit images"
                title="Edit images"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
              <button onClick={() => promptDelete(v.id)} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-2xl">Add vehicle</h2>
        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
        <Field label="Brand"><input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {["car","van","minibus","coupe","suv","truck","bike"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Listing">
            <select value={form.listing} onChange={(e) => setForm({ ...form, listing: e.target.value })} className="input">
              {["rent","sale","both"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Daily (GH₵)"><input value={form.daily_price} onChange={(e) => setForm({ ...form, daily_price: e.target.value })} className="input" /></Field>
          <Field label="Sale (GH₵)"><input value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="input" /></Field>
          <Field label="Seats"><input value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className="input" /></Field>
          <Field label="Bags"><input value={form.bags} onChange={(e) => setForm({ ...form, bags: e.target.value })} className="input" /></Field>
          <Field label="Fuel">
            <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="input">
              {["petrol","diesel","electric","hybrid"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Transmission"><input value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="input" /></Field>
          <Field label="Year"><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input" /></Field>
          <Field label="Mileage"><input value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-20" /></Field>
        <Field label="Images (first is primary)">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-background/50 px-4 py-6 text-center text-xs text-foreground/70 transition hover:border-primary hover:text-foreground">
            <Plus className="h-5 w-5" />
            <span className="font-semibold">{uploading ? "Uploading…" : "Click to upload images"}</span>
            <span className="text-[11px] text-foreground/50">PNG, JPG, WEBP · multiple allowed</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => { if (e.target.files?.length) { uploadImages(e.target.files); e.target.value = ""; } }}
              className="hidden"
            />
          </label>
          {(form.primary_image_url || gallery.length > 0) && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[form.primary_image_url, ...gallery].filter(Boolean).map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-full rounded-md object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">PRIMARY</span>}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add vehicle
        </button>
        <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-background);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem}`}</style>
      </form>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.mode === "deactivate" ? (
                <><EyeOff className="h-5 w-5 text-amber-500" /> Deactivate vehicle</>
              ) : (
                <><Trash2 className="h-5 w-5 text-destructive" /> Delete vehicle</>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {confirmDialog.mode === "deactivate" ? (
                <>
                  <p>Deactivating hides this vehicle from customers, but it <strong>stays in your records</strong> because it is linked to existing bookings or purchase requests.</p>
                  <ul className="list-disc space-y-1 pl-4 text-foreground/80">
                    <li>Customers will no longer see it in the vehicle list.</li>
                    <li>Existing bookings and purchase requests remain intact.</li>
                    <li>You can reactivate it later by editing the vehicle.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>Are you sure you want to delete this vehicle? This action is permanent.</p>
                  <ul className="list-disc space-y-1 pl-4 text-foreground/80">
                    <li>All vehicle images will be removed.</li>
                    <li>If the vehicle has bookings or purchase requests, it cannot be deleted — you will be offered deactivation instead.</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirm}
              className={confirmDialog.mode === "deactivate" ? "bg-amber-500 text-amber-950 hover:bg-amber-500/90" : ""}
            >
              {confirmDialog.mode === "deactivate" ? "Deactivate vehicle" : "Delete vehicle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit images — {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-background/50 px-4 py-6 text-center text-xs text-foreground/70 transition hover:border-primary hover:text-foreground">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">{editUploading ? "Uploading…" : "Click to upload images"}</span>
              <span className="text-[11px] text-foreground/50">PNG, JPG, WEBP · multiple allowed</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={editUploading}
                onChange={(e) => { if (e.target.files?.length) { editUpload(e.target.files); e.target.value = ""; } }}
                className="hidden"
              />
            </label>

            {editGallery.length === 0 && !editPrimary ? (
              <p className="text-sm text-foreground/60">No images yet. Upload some above.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(editPrimary ? [{ url: editPrimary }, ...editGallery.filter((g) => g.url !== editPrimary)] : editGallery).map((img) => {
                  const isPrimary = img.url === editPrimary;
                  return (
                    <div key={img.url} className="relative">
                      <img src={img.url} alt="" className="h-24 w-full rounded-md object-cover" />
                      {isPrimary && (
                        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">PRIMARY</span>
                      )}
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(img.url)}
                          className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground shadow"
                          aria-label="Make primary"
                          title="Make primary"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeEditImage(img.url)}
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeEdit}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={editBusy}
              onClick={saveEditImages}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {editBusy ? "Saving…" : "Save changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}