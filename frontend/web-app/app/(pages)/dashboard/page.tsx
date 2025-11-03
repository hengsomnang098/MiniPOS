import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return <p>Not authenticated</p>;
  }

  if (session.expiresIn && Number(session.expiresIn) < Date.now()) {
    redirect("/auth/login?expired=true");
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
