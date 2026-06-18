import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GoCar" },
      { name: "description", content: "Get in touch with GoCar — phone, email, and our city locations." },
      { property: "og:title", content: "Contact GoCar" },
      { property: "og:description", content: "Phone, email, and our locations." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">— Contact —</p>
        <h1 className="mt-2 font-display text-5xl">We're a call away.</h1>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <Card icon={<Phone className="h-5 w-5" />} title="Phone" body="+1 202 102 2525" />
        <Card icon={<Mail className="h-5 w-5" />} title="Email" body="hello@gocar.app" />
        <Card icon={<MapPin className="h-5 w-5" />} title="Address" body="123 Drive Lane, Lagos" />
      </div>
    </section>
  ),
});

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-muted p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">{icon}</span>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{body}</p>
    </div>
  );
}