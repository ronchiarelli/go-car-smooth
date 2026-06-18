import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="font-display text-3xl tracking-wider">
      <span className="text-primary">GO</span>
      <span className={light ? "text-white" : "text-foreground"}>CAR</span>
    </Link>
  );
}