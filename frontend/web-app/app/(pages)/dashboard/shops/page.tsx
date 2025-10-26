import { getShops } from "@/app/actions/shopAction";
import { Metadata } from "next";
import React from "react";
import ShopsList from "./ShopsList";
import { getUsers } from "@/app/actions/userAction";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shops Dashboard",
  description: "Manage your shops",
};

export default async function Page() {
  // ✅ Just fetch first page once (initial load)
  const query = "?page=1&pageSize=10";
  const shops = await getShops(query);
  const userResult = await getUsers();

  const initialUser = Array.isArray(userResult) ? userResult : undefined;

  return (
    <div>
      <ShopsList initialShops={shops} initialUser={initialUser} />
    </div>
  );
}
