"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/shallow";
import { Users } from "@/types/user";
import { Roles } from "@/types/role";
import { PageResult } from "@/types/pageResult";
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
import { createUser, deleteUser, getUsers, updateUser } from "@/app/actions/userAction";
import { DataTable } from "@/components/DataTable";
import AppPagination from "@/components/AppPagination";
import { AppSearch } from "@/components/AppSearch";
import { useParamsStore } from "@/hooks/useParamStore";

const UserFormDialog = dynamic(() => import("./UserFormDialog").then((m) => m.UserFormDialog), {
  ssr: false,
  loading: () => <LoadingPage />,
});

interface UsersListProps {
  initialUsers: PageResult<Users>;
  initialRoles: Roles[];
}

export default function UsersList({ initialUsers, initialRoles }: UsersListProps) {
  const [users, setUsers] = useState(initialUsers.items);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Users | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { pageNumber, pageSize, totalPages, search, setParams } = useParamsStore(
    useShallow((state) => ({
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      totalPages: state.totalPages,
      search: state.search,
      setParams: state.setParams,
    }))
  );

  // Initialize pagination from server
  useEffect(() => {
    setParams({
      pageNumber: initialUsers.pageNumber,
      pageSize: initialUsers.pageSize,
      totalPages: initialUsers.totalPages,
    });
  }, [initialUsers, setParams]);

  // 🔄 Fetch users
  async function refreshPage(page = pageNumber, term = search || "") {
    const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""}`;
    const result = await getUsers(query);

    if (!result || result.isSuccess === false) {
      toast({
        title: "Error loading users",
        description: "Failed to refresh user list.",
        variant: "destructive",
      });
      return;
    }

    setUsers(result.items);
    setParams({
      pageNumber: result.pageNumber,
      totalPages: result.totalPages,
    });
  }

  // ➕ CREATE (Hybrid: local insert if on page 1, else refetch)
  async function handleCreate(data: Partial<Users>) {
    const result = await createUser(data);
    if (result.success === false) {
      toast({
        title: "Failed to Create User",
        description: result.error || result.validationErrors?.join(", ") || "An error occurred.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      if (pageNumber === 1) {
        // 🧠 Prepend locally for instant update
        setUsers((prev) => {
          const updated = [result, ...prev];
          return updated.length > pageSize ? updated.slice(0, pageSize) : updated;
        });
      } else {
        // 🌐 If not on first page, just refetch
        await refreshPage(pageNumber);
      }

      // Recalculate total pages if needed
      const newTotalPages = users.length + 1 > pageSize * totalPages ? totalPages + 1 : totalPages;
      setParams({ totalPages: newTotalPages });
    });

    toast({ title: "User Created", description: `${result.fullName} created.` });
  }

  // ✏️ UPDATE (Hybrid: local replace only)
  async function handleUpdate(id: string, data: Partial<Users>) {
    const result = await updateUser(id, { ...data, id });
    if (result.success === false) {
      toast({
        title: "Failed to Update User",
        description: result.error || result.validationErrors?.join(", ") || "An error occurred.",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = result.data as Users;
    startTransition(() => {
      // Replace locally
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));
    });

    toast({ title: "User Updated", description: `${updatedUser.fullName} updated.` });
  }

  // 🗑️ DELETE (Hybrid: local remove + smart refresh if needed)
  async function handleDelete(id: string) {
    const result = await deleteUser(id);
    if (result.validationErrors || result.errors) {
      toast({
        title: "Failed to Delete User",
        description: result.validationErrors?.join(", ") || result.errors || "An error occurred.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const remaining = users.filter((user) => user.id !== id);
      setUsers(remaining);

      // If last item on page deleted → move one page back
      if (remaining.length === 0 && pageNumber > 1) {
        setParams({ pageNumber: pageNumber - 1 });
        await refreshPage(pageNumber - 1);
      }
      // If deleted last on last page → adjust total pages
      else if (remaining.length === 0 && totalPages > 1 && pageNumber === totalPages) {
        setParams({ totalPages: totalPages - 1 });
      }
      // Else if list got shorter but not empty → just stay and show local change
    });

    toast({ title: "User Deleted", description: `User has been deleted.` });
  }

  // 🔍 SEARCH
  async function handleSearch(term: string) {
    setParams({ search: term, pageNumber: 1 });
    await refreshPage(1, term);
  }

  // 📄 PAGINATION
  async function handlePageChange(newPage: number) {
    setParams({ pageNumber: newPage });
    await refreshPage(newPage);
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

      {/* Search */}
      <AppSearch
        placeholder="Search by name or email..."
        onSearch={handleSearch}
        defaultValue={search}
        className="max-w-md"
      />

      {isPending && <LoadingPage />}

      {/* Data Table */}
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
                        Permanently remove{" "}
                        <strong>{(user as Users).fullName}</strong>?
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
          editingUser
            ? (data) => handleUpdate(editingUser.id, data)
            : handleCreate
        }
        user={editingUser}
        roles={initialRoles}
      />

      {/* Pagination */}
      <div className="flex justify-end pt-4">
        <AppPagination
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
