"use client"

import { Roles } from "@/types/role"
import { Permissions } from "@/types/permission"
import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createRole, deleteRole, updateRole } from "@/app/actions/roleActions"
import { PermissionButton } from "@/components/permissionButton/PermissionButton"
import LoadingPage from "../loading"
import { DataTable } from "@/components/DataTable"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import RoleFormDialog from "./RoleFormDialog"

interface RolesClientProps {
    initialRoles: Roles[]
    initialPermissions: Permissions[]
}

export function RolesList({
    initialRoles,
    initialPermissions }:
    RolesClientProps) {

    const [roles, setRoles] = useState(initialRoles);
    const [open, setOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Roles | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    async function handleCreate(data: Partial<Roles>) {
        startTransition(async () => {
            const result = await createRole(data);

            if (result && !('error' in result)) {
                setRoles((prev) => [...prev, result]);
                toast({
                    title: "✅ Role Created",
                    description: `${result.name} added successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Create Role",
                    description: (result && 'error' in result && result.error) || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        })
    }

    async function handleUpdate(id: string, data: Partial<Roles>) {
        startTransition(async () => {
            const result = await updateRole(id, data);

            if (result && !('error' in result)) {
                setRoles((prev) =>
                    prev.map((role) => (role.id === id ? result : role))
                );
                toast({
                    title: "✅ Role Updated",
                    description: `${result.name} updated successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Update Role",
                    description: (result && 'error' in result && result.error) || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        });
    }

    async function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteRole(id);

            if (result.success) {
                setRoles((prev) => prev.filter((role) => role.id !== id));
                toast({
                    title: "✅ Role Deleted",
                    description: "Role deleted successfully.",
                });
            } else {
                toast({
                    title: "Failed to Delete Role",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        });
    }


    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">All Roles & Permissions</h2>
                <PermissionButton
                    permission="Roles.Create"
                    className="bg-cyan-500"
                    onClick={() => {
                        setEditingRole(null);
                        setOpen(true);
                    }}
                >
                    + Add Role
                </PermissionButton>
            </div>

            {isPending && <LoadingPage />}

            {/* DataTable */}
            <DataTable
                data={roles}
                columns={[
                    { key: "name", label: "Role Name" },
                    { key: "description", label: "Description" },
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-right",
                        render: (role) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Roles.Update"
                                    onClick={() => {
                                        setEditingRole(role);
                                        setOpen(true);
                                        console.log(role)
                                    }}
                                >
                                    Edit
                                </PermissionButton>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <PermissionButton
                                            size="sm"
                                            variant="destructive"
                                            permission="Roles.Delete"
                                        >
                                            Delete
                                        </PermissionButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently remove <strong>{role.name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(role.id)}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ),
                    },
                ]}
            />

            {/* Create/Edit Dialog */}
            <RoleFormDialog
                open={open}
                setOpen={setOpen}
                onSubmit={
                    editingRole ? (data) => handleUpdate(editingRole.id, data) : handleCreate
                }
                permissions={initialPermissions}
                role={editingRole}
            />
        </div>
    )
}