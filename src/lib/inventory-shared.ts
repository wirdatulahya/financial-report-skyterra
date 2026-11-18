// Konstanta & tipe Inventaris yang aman dipakai di komponen client.

export const SPAREPART_CATEGORIES = [
  "Drone & UAV",
  "GNSS / GPS",
  "Total Station",
  "LiDAR & Sensor",
  "Baterai & Daya",
  "Aksesori",
  "Lainnya",
] as const;

export interface Sparepart {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number; // harga satuan (Rp)
  updatedAt: string; // ISO datetime
}

export type MovementType = "in" | "out";

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  qty: number;
  stockAfter: number;
  note: string;
  by: string; // nama user
  at: string; // ISO datetime
}

export type SparepartInput = Pick<Sparepart, "name" | "category" | "stock" | "minStock" | "price">;

export function isLowStock(item: Pick<Sparepart, "stock" | "minStock">): boolean {
  return item.stock < item.minStock;
}
