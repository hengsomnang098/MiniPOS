// stores/useShopStore.ts
"use client";

import { create } from "zustand";

interface Shop {
  id: string;
  name: string;
}

interface ShopState {
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop) => void;
  clearShop: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  selectedShop: null,
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  clearShop: () => set({ selectedShop: null }),
}));
