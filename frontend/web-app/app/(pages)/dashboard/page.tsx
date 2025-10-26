import { auth } from "@/app/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return <p>Not authenticated</p>;
  }

  return (
    <div className="p-6">
      <h1>Welcome, {session.user.fullName}</h1>
      <p>Roles: {session.user.roles.join(", ")}</p>
      <p>Email: {session.user.email}</p>
      <p>Permissions: {session.user.permissions.join(", ")}</p>
    </div>
  );
}
