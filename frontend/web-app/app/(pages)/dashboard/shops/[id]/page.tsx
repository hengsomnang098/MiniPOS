
import { getShopUsers } from "@/app/actions/shopUserAction";
import { getUsers } from "@/app/actions/userAction";
import ShopUsersList from "./ShopUsersList";



interface ShopDetailPageProps {
  params: { id: string };
}
export const dynamic = "force-dynamic";

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { id } = await params;
  const shopuers = await getShopUsers(id);
  const usersResult = await getUsers();
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
