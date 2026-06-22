import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

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
  fuel: "petrol", transmission: "automatic", year: "", mileage: "",
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

  async function uploadImage(file: File) {
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.storage.from("vehicle-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (data?.signedUrl) setForm((f) => ({ ...f, primary_image_url: data.signedUrl }));
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
      const { error } = await supabase.from("vehicles").insert(payload);
      if (error) throw error;
      toast.success("Vehicle added");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-vehicles"] }); }
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
                {v.daily_price && <p>${Number(v.daily_price)}/day</p>}
                {v.sale_price && <p>${Number(v.sale_price).toLocaleString()}</p>}
              </div>
              <button onClick={() => remove(v.id)} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
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
              {["car","van","minibus","coupe","suv","truck"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Listing">
            <select value={form.listing} onChange={(e) => setForm({ ...form, listing: e.target.value })} className="input">
              {["rent","sale","both"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Daily $"><input value={form.daily_price} onChange={(e) => setForm({ ...form, daily_price: e.target.value })} className="input" /></Field>
          <Field label="Sale $"><input value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="input" /></Field>
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
        <Field label="Primary image">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-xs" />
          {form.primary_image_url && <img src={form.primary_image_url} alt="" className="mt-2 h-24 w-full rounded-md object-cover" />}
        </Field>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add vehicle
        </button>
        <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-background);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem}`}</style>
      </form>
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