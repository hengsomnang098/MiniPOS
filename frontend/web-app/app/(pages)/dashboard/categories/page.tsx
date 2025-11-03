
import { getCategoryByShop } from '@/app/actions/categoryAction';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'
import CategoriesList from './CategoriesList';

export default async function page() {
    const shopId  = (await cookies()).get("activeShopId")?.value;
    if (!shopId) {
        return redirect('/');
    }
    const query = "?page=1&pageSize=5";

    const [categories] = await Promise.all([
        getCategoryByShop(query,shopId)
    ]);

    return (
        <div className="container mx-auto py-6">
            <CategoriesList initialCategories={categories} shopId={shopId} />
        </div>
    )
}
