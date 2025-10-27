
import { getAvailablePermissions, getRoles } from "@/app/actions/roleActions"
import { RolesList } from "./RolesList"

export const dynamic = "force-dynamic";

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
