

export interface ShopUser {
  id: string;
  shopId: string;
  shop: string;   // ✅ it's a name, not an array
  userId: string;
  user: string;   // ✅ it's a name, not an array
}
