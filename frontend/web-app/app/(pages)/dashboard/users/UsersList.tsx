"use client";

import { useState, useTransition } from "react";
import { Users } from "@/types/user";
import { Roles } from "@/types/role";
import { PermissionButton } from "@/components/permissionButton/PermissionButton";
import { useToast } from "@/components/ui/use-toast";
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
import LoadingPage from "../loading";
import { createUser, deleteUser, updateUser } from "@/app/actions/userAction";
// import { UserFormDialog } from "./UserFormDialog";
import { DataTable } from "@/components/DataTable";
import dynamic from "next/dynamic";

const UserFormDialog = dynamic(() => import("./UserFormDialog").then(m => m.UserFormDialog), {
  ssr: false,
  loading: () => <LoadingPage />
})


interface UsersListProps {
  initialUsers: Users[];
  initialRoles: Roles[];
}

export default function UsersList({
  initialUsers,
  initialRoles,
}: UsersListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Users | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Create User
  async function handleCreate(data: Partial<Users>) {
    startTransition(async () => {
      const result = await createUser(data);

      if (result.success) {
        setUsers((prev) => [...prev, result.data!]);
        toast({
          title: "✅ User Created",
          description: `${result.data!.fullName} added successfully.`,
        });
      } else {
        toast({
            title: "Failed to Create User",
            description: result.error || "An unknown error occurred.",
            variant: "destructive",
          });
      }
    });
  }


  // Update User
  async function handleUpdate(id: string, data: Partial<Users>) {
    startTransition(async () => {
      const result = await updateUser(id, { ...data, id });
      if (result && result.success && result.data) {
        setUsers((prev) => prev.map((u) => (u.id === id ? result.data! : u)));
        setEditingUser(null);
        toast({ title: "User Updated", description: `${result.data.fullName} updated.` });
      } else {
        toast({
          title: "Failed to Update User",
          description: (result && result.error) || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  // Delete User
  async function handleDelete(id: string) {
    startTransition(async () => {
      const ok = await deleteUser(id);
      if (ok.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast({ title: "User Deleted", description: "User removed successfully." });
      } else {
        toast({
          title: "Failed to Delete User",
          description: (ok && ok.error) || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">All Users</h2>
        <PermissionButton
          permission="Users.Create"
          className="bg-cyan-500"
          onClick={() => {
            setEditingUser(null);
            setOpen(true);
          }}
        >
          + Add User
        </PermissionButton>
      </div>

      {isPending && <LoadingPage />}

      {/* DataTable */}
      <DataTable
        data={users}
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (user) => (
              <div className="space-x-2 text-right">
                <PermissionButton
                  size="sm"
                  // variant="outline"
                  permission="Users.Update"
                  className="bg-yellow-500 hover:bg-yellow-300"
                  onClick={() => {
                    setEditingUser(user as Users);
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
                      permission="Users.Delete"
                    >
                      Delete
                    </PermissionButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Permanently remove <strong>{(user as Users).fullName}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (typeof user.id === "string") {
                            handleDelete(user.id);
                          }
                        }}
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
      <UserFormDialog
        open={open}
        setOpen={setOpen}
        onSubmit={
          editingUser ? (data) => handleUpdate(editingUser.id, data) : handleCreate
        }
        user={editingUser}
        roles={initialRoles}
      />
    </div>
  );
}
