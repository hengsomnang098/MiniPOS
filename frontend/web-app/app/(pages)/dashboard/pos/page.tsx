import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProductsByShop } from "@/app/actions/productAction";
import { getAllCategories } from "@/app/actions/categoryAction";
import PosView from "./PosView";

export default async function Page() {
  const shopId = (await cookies()).get("activeShopId")?.value;

  if (!shopId) return redirect("/");

  const initialProducts = await getProductsByShop("?page=1&pageSize=12", shopId);
  const categories = await getAllCategories(shopId);

  return <PosView initialProducts={initialProducts} shopId={shopId} categories={categories} />;
}
