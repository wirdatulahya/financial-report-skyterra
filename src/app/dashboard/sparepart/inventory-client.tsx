"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { SPAREPART_CATEGORIES, type Sparepart, type StockMovement } from "@/lib/inventory-shared";
import {
  adjustStockAction,
  deleteSparepartAction,
  saveSparepartAction,
  type FormResult,
} from "@/lib/inventory-actions";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan aria-[invalid=true]:border-rose-400";
const primaryBtn =
  "flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50";
const secondaryBtn =
  "flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors";

const isLow = (i: Pick<Sparepart, "stock" | "minStock">) => i.stock < i.minStock;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

// ──────────────── Komponen umum ────────────────
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

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryBtn}>
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function FormAlert({ state }: { state: FormResult }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {state.message}
    </p>
  );
}

// ──────────────── Tambah / Edit barang ────────────────
function ItemModal({
  item,
  onClose,
  onDone,
}: {
  item: Sparepart | null; // null = tambah baru
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [state, action] = useFormState<FormResult, FormData>(saveSparepartAction, { status: "idle" });
  const fe = state.fieldErrors ?? {};
  const editing = !!item;

  useEffect(() => {
    if (state.status === "success") onDone(state.message ?? "Tersimpan.");
  }, [state, onDone]);

  const numProps = (name: string) => ({
    id: `item-${name}`,
    name,
    type: "number",
    min: 0,
    step: 1,
    inputMode: "numeric" as const,
    "aria-invalid": !!fe[name],
    "aria-describedby": fe[name] ? `item-${name}-err` : undefined,
    className: inputCls,
  });

  return (
    <Modal title={editing ? "Edit Barang" : "Tambah Barang Baru"} onClose={onClose}>
      <form action={action} className="space-y-4" noValidate>
        {item && <input type="hidden" name="id" value={item.id} />}
        <FormAlert state={state} />

        <Field id="item-name" label="Nama barang" error={fe.name}>
          <input
            id="item-name"
            name="name"
            defaultValue={item?.name}
            maxLength={120}
            placeholder="cth. Baterai DJI Matrice 350 (TB65)"
            aria-invalid={!!fe.name}
            className={inputCls}
          />
        </Field>

        <Field id="item-category" label="Kategori" error={fe.category}>
          <select id="item-category" name="category" defaultValue={item?.category ?? ""} aria-invalid={!!fe.category} className={inputCls}>
            <option value="" disabled>
              Pilih kategori
            </option>
            {SPAREPART_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {editing ? (
            <div>
              <p className="block text-xs font-semibold text-gray-600 mb-1">Stok saat ini</p>
              <p className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-500">
                {item.stock} unit · ubah lewat Stok Masuk/Keluar
              </p>
            </div>
          ) : (
            <Field id="item-stock" label="Stok awal" error={fe.stock}>
              <input {...numProps("stock")} defaultValue={0} />
            </Field>
          )}
          <Field id="item-minStock" label="Min. stok" error={fe.minStock}>
            <input {...numProps("minStock")} defaultValue={item?.minStock ?? 0} />
          </Field>
        </div>

        <Field id="item-price" label="Harga satuan (Rp)" error={fe.price}>
          <input {...numProps("price")} defaultValue={item?.price ?? ""} placeholder="0" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Batal
          </button>
          <SubmitButton label={editing ? "Simpan Perubahan" : "Tambah Barang"} pendingLabel="Menyimpan…" />
        </div>
      </form>
    </Modal>
  );
}

// ──────────────── Stok masuk / keluar ────────────────
function StockModal({
  item,
  initialType,
  onClose,
  onDone,
}: {
  item: Sparepart;
  initialType: "in" | "out";
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [state, action] = useFormState<FormResult, FormData>(adjustStockAction, { status: "idle" });
  const [type, setType] = useState(initialType);
  const [qty, setQty] = useState("");
  const n = /^\d+$/.test(qty) ? Number(qty) : 0;
  const after = type === "in" ? item.stock + n : item.stock - n;

  useEffect(() => {
    if (state.status === "success") onDone(state.message ?? "Tersimpan.");
  }, [state, onDone]);

  return (
    <Modal title="Update Stok" onClose={onClose}>
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="type" value={type} />

        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Stok saat ini <span className="font-semibold text-gray-700">{item.stock}</span> · Min. {item.minStock}
          </p>
        </div>

        <FormAlert state={state} />

        <div className="grid grid-cols-2 rounded-xl border border-gray-200 p-1" role="radiogroup" aria-label="Jenis mutasi">
          {(["in", "out"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === t
                  ? t === "in"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "in" ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
              {t === "in" ? "Stok Masuk" : "Stok Keluar"}
            </button>
          ))}
        </div>

        <Field id="stock-qty" label="Jumlah (unit)" error={state.fieldErrors?.qty}>
          <input
            id="stock-qty"
            name="qty"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-invalid={!!state.fieldErrors?.qty}
            className={inputCls}
            autoFocus
          />
        </Field>

        <Field id="stock-note" label="Keterangan (opsional)">
          <input
            id="stock-note"
            name="note"
            maxLength={200}
            placeholder={type === "in" ? "cth. Pembelian dari vendor" : "cth. Dipakai proyek survei Cianjur"}
            className={inputCls}
          />
        </Field>

        {n > 0 && (
          <p className={`text-sm ${after < 0 ? "text-rose-600" : after < item.minStock ? "text-amber-700" : "text-gray-600"}`}>
            {after < 0
              ? `Stok tidak cukup — maksimal ${item.stock} unit bisa dikeluarkan.`
              : `Stok setelah dicatat: ${after} unit${after < item.minStock ? " (di bawah batas minimum)" : ""}.`}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Batal
          </button>
          <SubmitButton label="Catat" pendingLabel="Menyimpan…" />
        </div>
      </form>
    </Modal>
  );
}

// ──────────────── Halaman ────────────────
export default function InventoryClient({
  items,
  movements,
  canManage,
}: {
  items: Sparepart[];
  movements: StockMovement[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [editItem, setEditItem] = useState<Sparepart | null | undefined>(undefined); // undefined = tutup
  const [stockFor, setStockFor] = useState<{ item: Sparepart; type: "in" | "out" } | null>(null);
  const [toDelete, setToDelete] = useState<Sparepart | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const lowItems = items.filter(isLow);
  const totalUnits = items.reduce((s, i) => s + i.stock, 0);
  const totalValue = items.reduce((s, i) => s + i.stock * i.price, 0);

  const filtered = items.filter(
    (i) =>
      (category === "all" || i.category === category) &&
      (!onlyLow || isLow(i)) &&
      (!query || i.name.toLowerCase().includes(query.toLowerCase()))
  );

  const done = (msg: string) => {
    setEditItem(undefined);
    setStockFor(null);
    setNotice({ ok: true, text: msg });
  };

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    startDelete(async () => {
      const res = await deleteSparepartAction(target.id);
      setToDelete(null);
      setNotice({ ok: res.status === "success", text: res.status === "success" ? `"${target.name}" dihapus.` : res.message ?? "Gagal menghapus." });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaris Sparepart</h1>
          <p className="text-sm text-gray-500 mt-1">Stok suku cadang alat survei dan pemetaan geospasial.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setEditItem(null)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Tambah Barang
          </button>
        )}
      </div>

      {notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm border ${
            notice.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Alert stok menipis */}
      {lowItems.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-700">
              {lowItems.length} barang di bawah batas minimum stok
            </p>
            <p className="text-sm text-rose-600 mt-0.5">
              {lowItems
                .slice(0, 4)
                .map((i) => `${i.name} (${i.stock}/${i.minStock})`)
                .join(", ")}
              {lowItems.length > 4 && `, dan ${lowItems.length - 4} lainnya`}
            </p>
          </div>
          <button
            onClick={() => setOnlyLow(true)}
            className="shrink-0 text-xs font-semibold text-rose-700 hover:underline"
          >
            Tampilkan
          </button>
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Jenis Barang", value: `${items.length} item` },
          { label: "Total Unit", value: `${totalUnits.toLocaleString("id-ID")} unit` },
          { label: "Nilai Persediaan", value: formatRupiah(totalValue) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 font-medium">{c.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${items.length ? "text-gray-800" : "text-gray-300"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {items.length === 0 ? (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-sm font-bold text-gray-700">Daftar Sparepart</h2>
              {canManage && (
                <button
                  onClick={() => setEditItem(null)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Barang
                </button>
              )}
            </div>
            <div className="py-14 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300" />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-700">Belum ada sparepart</p>
              <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">
                {canManage
                  ? "Tambahkan barang pertama untuk mulai memantau stok suku cadang."
                  : "Data akan tampil setelah Manajer Divisi atau Super Admin menambahkan barang."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Filter kategori"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 bg-white"
                >
                  <option value="all">Semua kategori</option>
                  {SPAREPART_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2 select-none">
                  <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="rounded border-gray-300" />
                  Hanya stok menipis
                </label>
                <span className="text-xs text-gray-400">{filtered.length} barang</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-72">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama barang..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                  />
                </div>
                {canManage && (
                  <button
                    onClick={() => setEditItem(null)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Tambah Barang
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-semibold">Nama Barang</th>
                    <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                    <th className="text-right py-3 px-3 font-semibold">Stok</th>
                    <th className="text-right py-3 px-3 font-semibold">Min. Stok</th>
                    <th className="text-right py-3 px-3 font-semibold">Harga Satuan</th>
                    <th className="text-left py-3 px-3 font-semibold">Status</th>
                    {canManage && <th className="py-3 px-3 font-semibold text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const low = isLow(i);
                    return (
                      <tr
                        key={i.id}
                        className={`border-b border-gray-50 transition-colors ${
                          low ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className={`py-3 px-3 font-medium ${low ? "text-rose-700 border-l-2 border-rose-500" : "text-gray-800"}`}>
                          {i.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{i.category}</span>
                        </td>
                        <td className={`py-3 px-3 text-right font-bold tabular-nums ${low ? "text-rose-600" : "text-gray-800"}`}>
                          {i.stock}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500 tabular-nums">{i.minStock}</td>
                        <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap tabular-nums">{formatRupiah(i.price)}</td>
                        <td className="py-3 px-3">
                          {low ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" /> {i.stock === 0 ? "Habis" : "Menipis"}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Aman</span>
                          )}
                        </td>
                        {canManage && (
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setStockFor({ item: i, type: "in" })}
                                title="Stok masuk"
                                aria-label={`Stok masuk ${i.name}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <ArrowDownToLine className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setStockFor({ item: i, type: "out" })}
                                title="Stok keluar"
                                aria-label={`Stok keluar ${i.name}`}
                                disabled={i.stock === 0}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                              >
                                <ArrowUpFromLine className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditItem(i)}
                                title="Edit"
                                aria-label={`Edit ${i.name}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-skyterra-blue hover:bg-skyterra-cyan/10 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setToDelete(i)}
                                title="Hapus"
                                aria-label={`Hapus ${i.name}`}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">Tidak ada barang yang cocok dengan filter.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Riwayat mutasi */}
      {movements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Boxes className="w-4 h-4 text-gray-400" /> Riwayat Stok Masuk / Keluar
          </h2>
          <ul className="divide-y divide-gray-50">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full w-16 text-center ${
                    m.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {m.type === "in" ? "Masuk" : "Keluar"}
                </span>
                <span className="flex-1 min-w-0 truncate text-gray-700">
                  <span className="font-medium">{m.itemName}</span>
                  {m.note && <span className="text-gray-400"> — {m.note}</span>}
                </span>
                <span className="tabular-nums font-semibold text-gray-700 whitespace-nowrap">
                  {m.type === "in" ? "+" : "−"}
                  {m.qty} → {m.stockAfter}
                </span>
                <span className="hidden md:block text-xs text-gray-400 whitespace-nowrap w-40 text-right">
                  {m.by} · {fmtDateTime(m.at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editItem !== undefined && (
        <ItemModal key={editItem?.id ?? "new"} item={editItem} onClose={() => setEditItem(undefined)} onDone={done} />
      )}
      {stockFor && (
        <StockModal
          key={stockFor.item.id + stockFor.type}
          item={stockFor.item}
          initialType={stockFor.type}
          onClose={() => setStockFor(null)}
          onDone={done}
        />
      )}
      {toDelete && (
        <Modal title="Hapus barang?" onClose={() => setToDelete(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{toDelete.name}</span> (stok {toDelete.stock}) akan dihapus permanen
            dari daftar inventaris.
          </p>
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={() => setToDelete(null)} disabled={deleting} className={secondaryBtn}>
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? "Menghapus…" : "Hapus"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
