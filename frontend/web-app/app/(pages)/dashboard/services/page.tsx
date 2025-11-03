import { getAllCategories } from "@/app/actions/categoryAction";
import { getServices } from "@/app/actions/servicesAction"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ServicesList from "./ServicesList";

export default async function page() {
    const shopId = (await cookies()).get("activeShopId")?.value;
      const query = "?page=1&pageSize=5";
    const services = await getServices(query, shopId || "");
    const categories = await getAllCategories(shopId || "");

    if (!shopId) {
        return redirect('/');
    }
    return (
        <>
            {
                services && categories && (
                    <div className="container mx-auto py-6">
                        <ServicesList initialServices={services} initialCategories={categories} shopId={shopId} />
                    </div>
                )
            }
        </>
    )
}
