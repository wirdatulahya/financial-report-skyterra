import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Masuk — SkyTerra Financial Portal",
};

// Garis kontur topografi: kurva tertutup dengan "noise" deterministik,
// sebagai pengingat dunia survei & pemetaan SkyTerra.
function contourPath(level: number): string {
  const cx = 300;
  const cy = 330;
  const base = 26 + level * 30;
  const steps = 72;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r =
      base +
      Math.sin(a * 3 + level * 0.6) * (6 + level * 1.6) +
      Math.cos(a * 2 - level * 0.4) * (4 + level * 1.2) +
      Math.sin(a * 5 + level) * 3;
    const x = cx + Math.cos(a) * r * 1.15;
    const y = cy + Math.sin(a) * r * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ") + "Z";
}

const LEVELS = Array.from({ length: 14 }, (_, i) => i);

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  return (
    <main className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] bg-white">
      {/* Panel peta */}
      <section
        aria-hidden="true"
        className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-skyterra-navy text-white p-12"
      >
        <svg
          viewBox="0 0 600 660"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {LEVELS.map((l) => (
            <path
              key={l}
              d={contourPath(l)}
              fill="none"
              stroke="currentColor"
              strokeWidth={l % 5 === 4 ? 1.4 : 0.7}
              className={l % 5 === 4 ? "text-skyterra-cyan/60" : "text-white/15"}
            />
          ))}
          <circle cx="300" cy="330" r="4" className="fill-skyterra-cyan" />
          <circle cx="300" cy="330" r="12" fill="none" strokeWidth="1" className="stroke-skyterra-cyan/70" />
        </svg>

        <div className="relative flex items-center gap-3">
          <Logo />
          <div>
            <p className="text-base font-semibold leading-tight">SkyTerra</p>
            <p className="text-xs text-white/60">PT SkyTerra Nusantara</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <p className="text-[2rem] font-semibold leading-[1.15] tracking-tight">
            Arus kas, stok alat survei, dan laporan keuangan dalam satu peta kerja.
          </p>
          <p className="mt-4 text-sm text-white/60 tabular-nums">
            Titik acuan 6°10′28″ LS, 106°49′37″ BT
          </p>
        </div>
      </section>

      {/* Formulir */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
            <p className="text-base font-semibold text-slate-900">SkyTerra</p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Masuk ke portal keuangan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gunakan akun kantor yang diberikan oleh Super Admin.
          </p>

          <LoginForm from={searchParams.from ?? ""} />
        </div>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-skyterra-cyan text-skyterra-navy">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17c3-4 6-4 9 0s6 4 9 0" strokeLinecap="round" />
        <path d="M3 11c3-4 6-4 9 0s6 4 9 0" strokeLinecap="round" opacity=".55" />
      </svg>
    </span>
  );
}
