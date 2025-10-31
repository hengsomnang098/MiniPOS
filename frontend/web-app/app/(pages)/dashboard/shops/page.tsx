import { getShops } from "@/app/actions/shopAction";
import React from "react";
// import ShopsList from "./ShopsList";
import { getUsers } from "@/app/actions/userAction";
import ShopsList from "./ShopsList";

export const dynamic = "force-dynamic";


export default async function Page() {
  // ✅ Just fetch first page once (initial load)
  const query = "?page=1&pageSize=5";
  const shops = await getShops(query);
  const userResult = await getUsers();

  const initialUser = Array.isArray(userResult) ? userResult : undefined;

  return (
    <div>
      <ShopsList initialShops={shops} initialUser={initialUser} />
    </div>
  );
}
