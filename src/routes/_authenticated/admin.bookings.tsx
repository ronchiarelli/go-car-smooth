import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, CalendarDays, Car, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

type Status = "pending" | "confirmed" | "cancelled" | "completed";

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  completed: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function eachDay(from: Date, to: Date) {
  const days: Date[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function AdminBookings() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date>(new Date());

  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(name, brand)")
        .order("pickup_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-bookings"] }); }
  }

  const activeBookings = useMemo(
    () => (data ?? []).filter((b: any) => b.status !== "cancelled"),
    [data],
  );

  const { confirmedDays, pendingDays, completedDays } = useMemo(() => {
    const confirmed: Date[] = [];
    const pending: Date[] = [];
    const completed: Date[] = [];
    for (const b of activeBookings as any[]) {
      const days = eachDay(new Date(b.pickup_at), new Date(b.return_at));
      if (b.status === "confirmed") confirmed.push(...days);
      else if (b.status === "pending") pending.push(...days);
      else if (b.status === "completed") completed.push(...days);
    }
    return { confirmedDays: confirmed, pendingDays: pending, completedDays: completed };
  }, [activeBookings]);

  const dayBookings = useMemo(() => {
    if (!selected) return [];
    return (data ?? []).filter((b: any) => {
      const days = eachDay(new Date(b.pickup_at), new Date(b.return_at));
      return days.some((d) => sameDay(d, selected));
    });
  }, [data, selected]);

  const visible = selected ? dayBookings : (data ?? []);

  const stats = useMemo(() => {
    const s = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const b of (data ?? []) as any[]) s[b.status as Status] = (s[b.status as Status] ?? 0) + 1;
    return s;
  }, [data]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Bookings</h2>
          <p className="text-sm text-foreground/60">Pick a date on the calendar to filter, or browse the full list.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <StatChip label="Pending" value={stats.pending} className={STATUS_STYLES.pending} />
          <StatChip label="Confirmed" value={stats.confirmed} className={STATUS_STYLES.confirmed} />
          <StatChip label="Completed" value={stats.completed} className={STATUS_STYLES.completed} />
          <StatChip label="Cancelled" value={stats.cancelled} className={STATUS_STYLES.cancelled} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-3xl border border-border bg-card p-4">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => setSelected(d)}
            month={month}
            onMonthChange={setMonth}
            modifiers={{
              confirmed: confirmedDays,
              pending: pendingDays,
              completed: completedDays,
            }}
            modifiersClassNames={{
              confirmed: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-emerald-500",
              pending: "relative before:absolute before:bottom-1 before:left-[40%] before:h-1 before:w-1 before:rounded-full before:bg-amber-500",
              completed: "relative [&_:after]:bg-sky-500",
            }}
            className="pointer-events-auto"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-foreground/70">
            <Dot color="bg-emerald-500" /> Confirmed
            <Dot color="bg-amber-500" /> Pending
            <Dot color="bg-sky-500" /> Completed
          </div>
          {selected && (
            <button
              onClick={() => setSelected(undefined)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              <X className="h-3 w-3" /> Clear date filter
            </button>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-foreground/60" />
            <span className="font-semibold">
              {selected ? selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "All bookings"}
            </span>
            <span className="text-foreground/60">· {visible.length} {visible.length === 1 ? "booking" : "bookings"}</span>
          </div>

          <div className="space-y-3">
            {!visible.length && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
                {selected ? "No bookings on this day." : "No bookings yet."}
              </div>
            )}
            {visible.map((b: any) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-foreground/60" />
                      <p className="truncate font-bold">{b.vehicles?.brand} {b.vehicles?.name ?? "Vehicle"}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground/70">
                      <CalendarDays className="h-3 w-3" />
                      <span>{new Date(b.pickup_at).toLocaleString()} → {new Date(b.return_at).toLocaleString()}</span>
                    </div>
                    {(b.pickup_location || b.dropoff_location) && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground/70">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{b.pickup_location} → {b.dropoff_location}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-primary">GH₵ {Number(b.total_price).toFixed(0)}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[b.status as Status]}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["pending","confirmed","completed","cancelled"] as Status[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(b.id, s)}
                      disabled={b.status === s}
                      className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${b.status === s ? `${STATUS_STYLES[s]} cursor-default` : "border-border hover:bg-muted"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold ${className}`}>
      {label} <span className="rounded-full bg-background/60 px-1.5">{value}</span>
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}