"use client";

import { create } from "zustand";
import { Product } from "@/types/product";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock?: number; // available stock for UI validation
}

interface CartState {
  items: CartItem[];
  discount: number; // fixed amount discount
  addProduct: (p: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  setDiscount: (amount: number) => void;
  subtotal: () => number;
  finalTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,

  addProduct: (p, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === p.id);
      const nextQty = (existing?.quantity || 0) + qty;
      const maxQty = p.quantity ?? nextQty;
      const limitedQty = Math.max(1, Math.min(nextQty, maxQty));

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === p.id ? { ...i, quantity: limitedQty } : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: limitedQty,
            imageUrl: p.imageUrl,
            stock: p.quantity,
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  increase: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min((i.quantity ?? 0) + 1, i.stock ?? i.quantity + 1) }
          : i
      ),
    })),

  decrease: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    })),

  setQuantity: (productId, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: Math.max(1, Math.min(qty, i.stock ?? qty)),
            }
          : i
      ),
    })),

  clear: () => set({ items: [], discount: 0 }),

  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  finalTotal: () => Math.max(0, get().subtotal() - get().discount),
}));
