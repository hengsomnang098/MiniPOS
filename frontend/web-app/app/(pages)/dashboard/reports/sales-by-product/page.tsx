import { cookies } from "next/headers";
import SalesByProductClient from "./SalesByProductClient";

export default async function SalesByProductPage() {
    const cookieStore = await cookies();
    const initialShopId = cookieStore.get("activeShopId")?.value ?? "";
    return <SalesByProductClient initialShopId={initialShopId} />;
}
