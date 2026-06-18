import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { BrandsBand } from "@/components/landing/BrandsBand";
import { Fleet } from "@/components/landing/Fleet";
import { Features } from "@/components/landing/Features";
import { HelpCTA } from "@/components/landing/HelpCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoCar — Rent or Buy Premium Cars & Bikes" },
      { name: "description", content: "Rent or buy premium cars, SUVs and bikes with free pickup, flexible pricing and 24/7 support." },
      { property: "og:title", content: "GoCar — Rent or Buy Premium Cars & Bikes" },
      { property: "og:description", content: "Premium fleet, flexible pricing, free pickup." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <BrandsBand />
      <Fleet />
      <Features />
      <HelpCTA />
    </>
  );
}
