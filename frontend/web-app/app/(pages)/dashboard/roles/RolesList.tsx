"use client"

import { Roles } from "@/types/role"
import { Permissions } from "@/types/permission"
import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createRole, deleteRole, updateRole } from "@/app/actions/roleActions"
import { PermissionButton } from "@/components/permissionButton/PermissionButton"
import LoadingPage from "../loading"

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
import { DataTable } from "@/components/DataTable"
import dynamic from "next/dynamic"
// import RoleFormDialog from "./RoleFormDialog"

const RoleFormDialog = dynamic(() => import("./RoleFormDialog").then(m => m.default), {
    ssr: false,
    loading: () => <LoadingPage />
})


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
            if (result.validationErrors || result.errors) {
                let errorMessages = [];
                if (typeof result.validationErrors === "object" && result.validationErrors !== null) {
                    // Flatten all error messages from the object
                    errorMessages = Object.values(result.validationErrors).flat();
                } else if (Array.isArray(result.validationErrors)) {
                    errorMessages = result.validationErrors;
                } else if (result.message) {
                    errorMessages = [result.message];
                } else {
                    errorMessages = ["An error occurred."];
                }
                toast({
                    title: "Failed to Create User",
                    description: errorMessages.join("\n"),
                    variant: "destructive",
                });
                return;
            }
            toast({
                title: "✅ Role Created",
                description: `${result.name} created successfully.`,
            });
            setRoles((prev) => [...prev, result]);
        })
    }

    async function handleUpdate(id: string, data: Partial<Roles>) {
        startTransition(async () => {
            const result = await updateRole(id, data);
            if (result.validationErrors || result.errors) {
                let errorMessages = [];
                if (typeof result.validationErrors === "object" && result.validationErrors !== null) {
                    // Flatten all error messages from the object
                    errorMessages = Object.values(result.validationErrors).flat();
                } else if (Array.isArray(result.validationErrors)) {
                    errorMessages = result.validationErrors;
                } else if (result.message) {
                    errorMessages = [result.message];
                } else {
                    errorMessages = ["An error occurred."];
                }
                toast({
                    title: "Failed to Update Role",
                    description: errorMessages.join("\n"),
                    variant: "destructive",
                });
                return;
            }
            toast({
                title: "✅ Role Updated",
                description: `${result.name} updated successfully.`,
            });
            setRoles((prev) =>
                prev.map((role) => (role.id === id ? result : role))
            );
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
                                    className="bg-yellow-500 hover:bg-yellow-300"
                                    onClick={() => {
                                        setEditingRole(role as Roles);
                                        setOpen(true);
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
                                                Permanently remove <strong>{(role as Roles).name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete((role as Roles).id)}
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