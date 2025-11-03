
import { getAllUsers } from "@/app/actions/userAction";
import ShopUsersList from "./ShopUsersList";
import { getShopUser } from "@/app/actions/shopUserAction";



interface ShopDetailPageProps {
  params: { id: string };
}
export const dynamic = "force-dynamic";

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const query = "?page=1&pageSize=10";
  const { id } = await params;
  const shopuers = await getShopUser(query, id);
  const usersResult = await getAllUsers();
  const users = Array.isArray(usersResult) ? usersResult : [];
  return (
    <>
      {
        shopuers ?
        (
          <ShopUsersList initialShopUser={shopuers} initialUser={users} shopUserId={id} />
        ) :
        <p>No shop users found.</p>
      }
    </>
  );
}
