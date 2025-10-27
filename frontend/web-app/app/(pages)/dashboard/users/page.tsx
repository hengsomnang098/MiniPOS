// app/dashboard/users/page.tsx
import { getRoles } from "@/app/actions/roleActions";
// import UsersList from "./UsersList";
import { getUsers } from "@/app/actions/userAction";
import UsersList from "./UsersList";

export const dynamic = "force-dynamic";

export default async function Page() {
  const usersPromise = getUsers();
  const rolePromise = getRoles();
  const [usersResult, roles] = await Promise.all([usersPromise, rolePromise]);

  // Check if usersResult is an array, otherwise handle error
  if (!Array.isArray(usersResult)) {
    // You can render an error message or handle it as needed
    return <div>Error loading users: {usersResult.error || "Unknown error"}</div>;
  }

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
