// app/dashboard/users/page.tsx
import { getRoles } from "@/app/actions/roleActions";
import UsersList from "./UsersList";
import { getUsers } from "@/app/actions/userAction";

export const dynamic = "force-dynamic";

export default async function Page() {
  const usersPromise = getUsers();
const rolePromise = getRoles();
const [users, roles] = await Promise.all([usersPromise, rolePromise]);

  return <>
    <UsersList initialUsers={users} initialRoles={roles} />
  </>;
}
