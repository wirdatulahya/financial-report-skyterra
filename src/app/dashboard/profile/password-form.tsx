"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePasswordAction, type PasswordState } from "@/lib/auth-actions";

const FIELDS = [
  { name: "current", label: "Kata sandi saat ini", autoComplete: "current-password" },
  { name: "new", label: "Kata sandi baru", autoComplete: "new-password" },
  { name: "confirm", label: "Ulangi kata sandi baru", autoComplete: "new-password" },
] as const;

export default function PasswordForm() {
  const [state, formAction] = useFormState<PasswordState, FormData>(changePasswordAction, {});
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Kosongkan form setelah berhasil
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-5 space-y-4" noValidate>
      {FIELDS.map((f) => {
        const invalid = state.status === "error" && state.field === f.name;
        return (
          <div key={f.name}>
            <label htmlFor={`pw-${f.name}`} className="block text-sm font-medium text-gray-700 mb-1.5">
              {f.label}
            </label>
            <input
              id={`pw-${f.name}`}
              name={f.name}
              type={show ? "text" : "password"}
              autoComplete={f.autoComplete}
              aria-invalid={invalid}
              aria-describedby={invalid ? "pw-error" : undefined}
              className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-skyterra-blue focus:outline-none focus:ring-2 focus:ring-skyterra-blue/20 aria-[invalid=true]:border-red-400"
            />
            {invalid && (
              <p id="pw-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {state.message}
              </p>
            )}
          </div>
        );
      })}

      <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="rounded border-gray-300"
        />
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        Tampilkan kata sandi
      </label>

      {state.status === "success" && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700"
        >
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-skyterra-navy text-white rounded-xl text-sm font-semibold hover:bg-skyterra-blue transition-colors disabled:opacity-70"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? "Menyimpan…" : "Simpan kata sandi"}
    </button>
  );
}
