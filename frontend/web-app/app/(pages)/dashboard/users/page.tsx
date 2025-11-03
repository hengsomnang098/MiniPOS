// app/dashboard/users/page.tsx
import { getRoles } from "@/app/actions/roleActions";
// import UsersList from "./UsersList";
import { getUsers } from "@/app/actions/userAction";
import UsersList from "./UsersList";

export const dynamic = "force-dynamic";

export default async function Page() {
  const query = "?page=1&pageSize=5";

  const usersPromise = getUsers(query);
  const rolePromise = getRoles();
  const [usersResult, roles] = await Promise.all([usersPromise, rolePromise]);

  return (
    <>
      {
        usersResult && roles && (
          <UsersList initialUsers={usersResult} initialRoles={roles} />
        )
      }
    </>
  );
}
