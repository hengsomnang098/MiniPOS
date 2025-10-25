import { Metadata } from "next"
import { getAvailablePermissions, getRoles } from "@/app/actions/roleActions"
import { RolesList } from "./RolesList"

export const metadata: Metadata = {
  title: "Roles",
  description: "Manage roles and permissions",
}

export default async function RolesPage() {
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getAvailablePermissions(),
  ])

  return (
    <div className="container mx-auto py-6">
      <RolesList initialRoles={roles} initialPermissions={permissions} />
    </div>
  )
}
