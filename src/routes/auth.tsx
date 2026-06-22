import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const authSearchSchema = z.object({
  mode: z.enum(["signin", "signup", "phone"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — GoCar" },
      { name: "description", content: "Sign in or create your GoCar account to rent or buy your next vehicle." },
      { property: "og:title", content: "Sign in — GoCar" },
      { property: "og:description", content: "Sign in or create your GoCar account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "phone">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      toast.error("Enter your email above, then click forgot password.");
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent. Check your email.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setResetting(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Sign-in failed");
      setBusy(false);
    }
    if (!result.redirected && !result.error) navigate({ to: "/account" });
  }

  async function onPhoneStart(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code sent");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onPhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      navigate({ to: "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-4xl">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-foreground/70">Rent or buy your next ride with GoCar.</p>

        <div className="mt-6 flex gap-2 text-xs font-bold uppercase">
          <TabBtn active={mode === "signin"} onClick={() => setMode("signin")}>Sign in</TabBtn>
          <TabBtn active={mode === "signup"} onClick={() => setMode("signup")}>Sign up</TabBtn>
          <TabBtn active={mode === "phone"} onClick={() => setMode("phone")}>Phone</TabBtn>
        </div>

        {mode !== "phone" ? (
          <form className="mt-6 space-y-3" onSubmit={onEmailSubmit}>
            {mode === "signup" && (
              <Input label="Full name" value={fullName} onChange={setFullName} required />
            )}
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Password" type="password" value={password} onChange={setPassword} required />
            {mode === "signin" && (
              <button
                type="button"
                onClick={onForgotPassword}
                disabled={resetting}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {resetting ? "Sending…" : "Forgot password?"}
              </button>
            )}
            <button disabled={busy} className="w-full rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        ) : !otpSent ? (
          <form className="mt-6 space-y-3" onSubmit={onPhoneStart}>
            <Input label="Phone (E.164, e.g. +234...)" value={phone} onChange={setPhone} required />
            <button disabled={busy} className="w-full rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              Send code
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={onPhoneVerify}>
            <Input label="Verification code" value={otp} onChange={setOtp} required />
            <button disabled={busy} className="w-full rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              Verify
            </button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-foreground/50">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button onClick={onGoogle} disabled={busy} className="w-full rounded-md border border-border bg-background py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-foreground/60">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </section>
  );
}

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 rounded-md px-3 py-2 ${active ? "bg-foreground text-background" : "bg-muted text-foreground/70"}`}>{children}</button>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}