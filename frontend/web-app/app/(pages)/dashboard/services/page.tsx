import { getCategoryByShop } from "@/app/actions/categoryAction";
import { getServices } from "@/app/actions/servicesAction"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ServicesList from "./ServicesList";

export default async function page() {
    const services = await getServices();
    const shopId = (await cookies()).get("activeShopId")?.value;
    const categories = await getCategoryByShop(shopId || "");

    if (!shopId) {
        return redirect('/');
    }
    return (
        <>
            {
                services && categories && (
                    <div className="container mx-auto py-6">
                        <ServicesList initialServices={services} initialCategories={categories} />
                    </div>
                )
            }
        </>
    )
}
