"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/auth-actions";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "admin@skyterra.co.id", password: "Admin#2026" },
  { role: "Manajer Divisi", email: "manajer@skyterra.co.id", password: "Manajer#2026" },
  { role: "Viewer", email: "viewer@skyterra.co.id", password: "Viewer#2026" },
];

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:border-skyterra-blue focus:outline-none focus:ring-2 focus:ring-skyterra-blue/20 " +
  "aria-[invalid=true]:border-red-500";

export default function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const hasError = Boolean(state.error);

  return (
    <>
      <form action={formAction} className="mt-8 space-y-5" noValidate>
        <input type="hidden" name="from" value={from} />

        {hasError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email kantor
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="nama@skyterra.co.id"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={hasError}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Kata sandi
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={hasError}
              className={inputClass + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyterra-blue/30"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-sm font-medium text-slate-700">Akun demo</p>
          <p className="mt-1 text-xs text-slate-500">
            Klik salah satu untuk mengisi formulir. Hanya tampil di mode pengembangan.
          </p>
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                  }}
                  className="flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="font-medium text-slate-800">{acc.role}</span>
                  <span className="truncate text-slate-500">{acc.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-skyterra-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-skyterra-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-skyterra-blue disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Memeriksa akun…" : "Masuk"}
    </button>
  );
}
