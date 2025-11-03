import { getProductsByShop } from '@/app/actions/productAction';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProductsList from './ProductsList';

export default async function page() {

    const shopId = (await cookies()).get("activeShopId")?.value;
    const query = "?page=1&pageSize=5";
    const products = await getProductsByShop(query, shopId || "");

    if (!shopId) {
        return redirect('/');
    }
    return (
        <ProductsList  initialProducts={products} shopId={shopId}/>
    )
}
