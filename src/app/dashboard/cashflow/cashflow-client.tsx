"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { categories, divisions, type Transaction } from "@/lib/mock-data";
import {
  addTransactionAction,
  deleteTransactionsAction,
  uploadTransactionsAction,
  type AddState,
  type UploadState,
} from "@/lib/transaction-actions";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan disabled:bg-gray-50 disabled:text-gray-500";
const primaryBtn =
  "flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn =
  "flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ label, pendingLabel, disabled, onClick }: { label: string; pendingLabel: string; disabled?: boolean; onClick?: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" onClick={onClick} disabled={disabled || pending} className={primaryBtn}>
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  );
}

// ──────────────── Tambah Transaksi (satuan) ────────────────
function AddTransactionModal({ onClose, lockedDivision }: { onClose: () => void; lockedDivision: string | null }) {
  const [state, action] = useFormState<AddState, FormData>(addTransactionAction, { status: "idle" });
  const [type, setType] = useState<"income" | "expense">("income");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state, onClose]);

  return (
    <Modal title="Tambah Transaksi Baru" onClose={onClose}>
      <form action={action} className="space-y-4">
        {state.status === "error" && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <ul className="list-disc pl-4 space-y-0.5">
              {state.messages?.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>
        )}
        <div>
          <label htmlFor="add-date" className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
          <input id="add-date" name="date" type="date" defaultValue={today} required className={inputCls} />
        </div>
        <div>
          <label htmlFor="add-desc" className="block text-xs font-semibold text-gray-600 mb-1">Keterangan</label>
          <input id="add-desc" name="description" type="text" maxLength={200} placeholder="Deskripsi transaksi..." required className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-type" className="block text-xs font-semibold text-gray-600 mb-1">Jenis</label>
            <select id="add-type" name="type" value={type} onChange={(e) => setType(e.target.value as "income" | "expense")} className={inputCls}>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label htmlFor="add-amount" className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Rp)</label>
            <input id="add-amount" name="amount" type="number" min={1} step={1} placeholder="0" required className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-div" className="block text-xs font-semibold text-gray-600 mb-1">Divisi</label>
            {lockedDivision ? (
              <>
                <input type="hidden" name="division" value={lockedDivision} />
                <input id="add-div" value={lockedDivision} disabled className={inputCls} />
              </>
            ) : (
              <select id="add-div" name="division" required defaultValue="" className={inputCls}>
                <option value="" disabled>Pilih divisi</option>
                {divisions.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="add-cat" className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
            <select id="add-cat" name="category" required defaultValue="" key={type} className={inputCls}>
              <option value="" disabled>Pilih kategori</option>
              {categories.filter((c) => c.type === type).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryBtn}>Batal</button>
          <SubmitButton label="Simpan Transaksi" pendingLabel="Menyimpan…" />
        </div>
      </form>
    </Modal>
  );
}

// ──────────────── Bulk Upload ────────────────
function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [state, action] = useFormState<UploadState, FormData>(uploadTransactionsAction, { status: "idle" });
  const [file, setFile] = useState<File | null>(null);
  const [stale, setStale] = useState(false); // hasil lama tidak berlaku setelah ganti file
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);

  useEffect(() => setStale(false), [state]);

  function pick(f: File | undefined | null) {
    if (!f || !inputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(f);
    inputRef.current.files = dt.files;
    setFile(f);
    setStale(true);
  }

  const result = stale ? { status: "idle" as const } : state;
  const imported = result.status === "imported";

  return (
    <Modal title="Bulk Upload Transaksi" onClose={onClose}>
      <form action={action}>
        <input ref={intentRef} type="hidden" name="intent" defaultValue="preview" />
        <input
          ref={inputRef}
          id="bulk-file"
          name="file"
          type="file"
          accept=".xlsx,.csv"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
          onClick={(e) => e.stopPropagation()}
        />

        {!imported && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); pick(e.dataTransfer.files?.[0]); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragActive ? "border-skyterra-cyan bg-skyterra-cyan/5" : "border-gray-200"
            }`}
          >
            {file ? (
              <div className="flex items-center gap-3 text-left">
                <FileSpreadsheet className="w-9 h-9 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-semibold text-skyterra-blue hover:underline"
                >
                  Ganti file
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Seret file Excel/CSV ke sini</p>
                <p className="text-xs text-gray-400 mt-1">atau pilih file (.xlsx, .csv — maksimal 500 baris, 2 MB)</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 px-5 py-2 bg-gray-100 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Pilih File
                </button>
              </>
            )}
          </div>
        )}

        {!imported && (
          <div className="flex items-center justify-between gap-3 mt-3 text-[11px] text-gray-400">
            <span>Kolom: Tanggal | Keterangan | Divisi | Kategori | Jenis (Masuk/Keluar) | Jumlah</span>
            <a href="/dashboard/cashflow/template" className="flex items-center gap-1 font-semibold text-skyterra-blue hover:underline whitespace-nowrap">
              <Download className="w-3.5 h-3.5" /> Template
            </a>
          </div>
        )}

        {/* Hasil */}
        {result.status === "error" && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {result.message}
          </p>
        )}

        {(result.status === "preview" || imported) && (
          <div className="mt-4 space-y-3">
            {imported ? (
              <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {result.message}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-gray-50 py-2.5">
                  <p className="text-lg font-bold text-gray-800">{result.totalRows}</p>
                  <p className="text-[11px] text-gray-500">Baris dibaca</p>
                </div>
                <div className="rounded-xl bg-emerald-50 py-2.5">
                  <p className="text-lg font-bold text-emerald-600">{result.validCount}</p>
                  <p className="text-[11px] text-emerald-700">Valid</p>
                </div>
                <div className="rounded-xl bg-rose-50 py-2.5">
                  <p className="text-lg font-bold text-rose-500">{result.errorCount}</p>
                  <p className="text-[11px] text-rose-600">Error</p>
                </div>
              </div>
            )}

            {!imported && !!result.preview?.length && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Pratinjau data valid</p>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 text-xs">
                  {result.preview.map((t, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate text-gray-700">{fmtDate(t.date)} · {t.description}</span>
                      <span className={`font-semibold whitespace-nowrap ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                        {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!result.errors?.length && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {imported ? "Baris yang dilewati" : "Baris error (tidak akan diimpor)"}
                </p>
                <ul className="max-h-40 overflow-y-auto divide-y divide-rose-100 rounded-xl border border-rose-100 bg-rose-50/40 text-xs">
                  {result.errors.map((e) => (
                    <li key={e.row} className="px-3 py-2">
                      <span className="font-semibold text-gray-700">Baris {e.row}:</span>{" "}
                      <span className="text-rose-600">{e.messages.join("; ")}</span>
                    </li>
                  ))}
                </ul>
                {(result.errorCount ?? 0) > result.errors.length && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Menampilkan {result.errors.length} dari {result.errorCount} error.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-5">
          {imported ? (
            <button type="button" onClick={onClose} className={primaryBtn}>Selesai</button>
          ) : (
            <>
              <button type="button" onClick={onClose} className={secondaryBtn}>Batal</button>
              {result.status === "preview" ? (
                <SubmitButton
                  label={`Impor ${result.validCount} Transaksi`}
                  pendingLabel="Mengimpor…"
                  disabled={!result.validCount}
                  onClick={() => intentRef.current && (intentRef.current.value = "import")}
                />
              ) : (
                <SubmitButton
                  label="Upload & Proses"
                  pendingLabel="Memeriksa file…"
                  disabled={!file}
                  onClick={() => intentRef.current && (intentRef.current.value = "preview")}
                />
              )}
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ──────────────── Konfirmasi Hapus ────────────────
function ConfirmDeleteModal({
  count,
  pending,
  onCancel,
  onConfirm,
}: {
  count: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="Hapus transaksi?" onClose={onCancel}>
      <p className="text-sm text-gray-600">
        {count === 1 ? "1 transaksi" : `${count} transaksi`} akan dihapus permanen dan tidak bisa dikembalikan.
      </p>
      <div className="flex gap-3 pt-6">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryBtn}>Batal</button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? "Menghapus…" : "Hapus"}
        </button>
      </div>
    </Modal>
  );
}

// ──────────────── Halaman Arus Kas ────────────────
export default function CashflowClient({
  transactions,
  canWrite,
  lockedDivision,
}: {
  transactions: Transaction[];
  canWrite: boolean;
  lockedDivision: string | null;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [deleting, startDelete] = useTransition();

  // Buang pilihan yang datanya sudah tidak ada
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(transactions.map((t) => t.id));
      const next = new Set(Array.from(prev).filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [transactions]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filtered = transactions.filter((trx) => {
    if (filterType !== "all" && trx.type !== filterType) return false;
    if (searchQuery && !trx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const isEmpty = transactions.length === 0;

  const allVisibleSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((t) => next.delete(t.id));
      else filtered.forEach((t) => next.add(t.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function confirmDelete() {
    if (!toDelete) return;
    const ids = toDelete;
    startDelete(async () => {
      const res = await deleteTransactionsAction(ids);
      setToDelete(null);
      if (res.ok) {
        setSelected((prev) => new Set(Array.from(prev).filter((id) => !ids.includes(id))));
        setNotice({ type: "ok", text: `${res.deleted} transaksi dihapus.` });
      } else {
        setNotice({ type: "error", text: res.message ?? "Gagal menghapus." });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arus Kas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola transaksi pemasukan dan pengeluaran harian perusahaan.
            {lockedDivision && <> Menampilkan data {lockedDivision}.</>}
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Tambah Transaksi
            </button>
          </div>
        )}
      </div>

      {notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm border ${
            notice.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Pemasukan", value: totalIncome, color: "text-emerald-600", bg: "bg-emerald-50", icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" /> },
          { label: "Total Pengeluaran", value: totalExpense, color: "text-rose-500", bg: "bg-rose-50", icon: <ArrowDownRight className="w-5 h-5 text-rose-500" /> },
          { label: "Saldo Bersih", value: totalIncome - totalExpense, color: "text-gray-800", bg: "bg-skyterra-cyan/10", icon: <ArrowUpRight className="w-5 h-5 text-skyterra-cyan" /> },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{c.label}</p>
              <p className={`text-lg font-bold ${isEmpty ? "text-gray-300" : c.color}`}>{formatRupiah(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {isEmpty ? (
          <div className="py-14 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-gray-300" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700">Belum ada transaksi</p>
            <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">
              {canWrite
                ? "Upload file Excel/CSV atau tambahkan transaksi satu per satu untuk mulai mencatat arus kas."
                : "Transaksi akan tampil di sini setelah Manajer Divisi atau Super Admin mencatatnya."}
            </p>
            {canWrite && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  {(["all", "income", "expense"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        filterType === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400 ml-1">{filtered.length} transaksi</span>
                {canWrite && selected.size > 0 && (
                  <button
                    onClick={() => setToDelete(Array.from(selected))}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus {selected.size} terpilih
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {canWrite && (
                      <th className="w-10 py-3 pl-3">
                        <input
                          type="checkbox"
                          aria-label="Pilih semua transaksi yang tampil"
                          checked={allVisibleSelected}
                          onChange={toggleAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-3 font-semibold">Tanggal</th>
                    <th className="text-left py-3 px-3 font-semibold">Keterangan</th>
                    <th className="text-left py-3 px-3 font-semibold">Divisi</th>
                    <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                    <th className="text-left py-3 px-3 font-semibold">Jenis</th>
                    <th className="text-right py-3 px-3 font-semibold">Jumlah</th>
                    {canWrite && <th className="w-12 py-3 px-3"><span className="sr-only">Aksi</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((trx) => (
                    <tr
                      key={trx.id}
                      className={`border-b border-gray-50 transition-colors ${selected.has(trx.id) ? "bg-skyterra-cyan/5" : "hover:bg-gray-50/50"}`}
                    >
                      {canWrite && (
                        <td className="py-3 pl-3">
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${trx.description}`}
                            checked={selected.has(trx.id)}
                            onChange={() => toggleOne(trx.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{fmtDate(trx.date)}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium max-w-xs truncate">{trx.description}</td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{trx.division}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{trx.category}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                          {trx.type === "income" ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${trx.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                        {trx.type === "income" ? "+" : "-"}{formatRupiah(trx.amount)}
                      </td>
                      {canWrite && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setToDelete([trx.id])}
                            aria-label={`Hapus ${trx.description}`}
                            title="Hapus"
                            className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">Tidak ada transaksi yang cocok dengan filter.</p>
              )}
            </div>
          </>
        )}
      </div>

      {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} lockedDivision={lockedDivision} />}
      {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} />}
      {toDelete && (
        <ConfirmDeleteModal
          count={toDelete.length}
          pending={deleting}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
