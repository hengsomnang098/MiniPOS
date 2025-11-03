'use client';

import React, { useState, useTransition } from 'react';
import { ShopUser } from '@/types/shopUser';
import { Users } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { PermissionButton } from '@/components/permissionButton/PermissionButton';
import LoadingPage from '../../loading';
import { assignUsersToShop, getShopUser, removeUserFromShop } from '@/app/actions/shopUserAction';
import { DataTable } from '@/components/DataTable';
import dynamic from 'next/dynamic';
import { PageResult } from '@/types/pageResult';
import { useParamsStore } from '@/hooks/useParamStore';
import { useShallow } from "zustand/shallow";
import AppPagination from '@/components/AppPagination';
import { AppSearch } from '@/components/AppSearch';

const ShopUserDialog = dynamic(() => import('./ShopUserDialog').then(m => m.default), {
  ssr: false,
  loading: () => <LoadingPage />,
});

interface ShopUsersListProps {
  initialShopUser: PageResult<ShopUser>;
  initialUser?: Users[];
  shopUserId?: string;
}


export default function ShopUsersList({ initialShopUser, initialUser, shopUserId }: ShopUsersListProps) {
  const [shopUsers, setShopUsers] = useState(initialShopUser.items || []);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // ✅ Zustand pagination store
  const { pageNumber, pageSize, totalPages, setParams, search } = useParamsStore(
    useShallow((state) => ({
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      totalPages: state.totalPages,
      search: state.search,
      setParams: state.setParams,
    }))
  );

  // ✅ Helper: refresh page after CRUD
  async function refreshPage(page = pageNumber, term = search || "") {
    const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""
      }`;
    const result = await getShopUser(query, shopUserId || "");

    if (!result || result.isSuccess === false) {
      toast({
        title: "Error loading shops",
        description: "Failed to refresh shop list.",
        variant: "destructive",
      });
      return;
    }

    setShopUsers(result.items);
    setParams({
      pageNumber: result.pageNumber,
      totalPages: result.totalPages,
    });
  }

  // 🔍 Handle search
  async function handleSearch(term: string) {
    setParams({ search: term, pageNumber: 1 });
    await refreshPage(1, term);
  }

  // ✅ Pagination
  async function handlePageChange(newPage: number) {
    startTransition(() => refreshPage(newPage));
  }

  async function handleCreate(shopId: string, userId: string[]) {
    if (!shopUserId) {
      toast({
        title: "Error",
        description: "Shop ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    shopId = shopUserId;
    startTransition(async () => {
      // Ensure using the correct shop ID
      const result = await assignUsersToShop(shopId, userId);
      console.log(result)
      if (!result) {
        toast({
          title: "Error",
          description: "Failed to assign users to shop.",
          variant: "destructive",
        });
        return;
      }
      setShopUsers((prev) => [...prev, ...result.data]);




      toast({
        title: "Success",
        description: result.message || "User(s) assigned to shop successfully.",
      });

      setOpen(false);
    });
  }


  async function handleDelete(item: ShopUser) {
    if (!item.shopId || !item.userId) {
      toast({
        title: "Error",
        description: "Missing shop or user ID.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await removeUserFromShop(item.shopId, item.userId);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Failed to remove user from shop.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: result.message || "User removed from shop successfully.",
      });

      // Optimistic UI update: remove the deleted user from table
      setShopUsers((prev) =>
        prev.filter((u) => !(u.shopId === item.shopId && u.userId === item.userId))
      );
    });
  }



  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>Shop Users List</h2>

      {/* Assign Button */}
      <PermissionButton
        onClick={() => setOpen(true)}
        permission="Shops.Create"
      >
        + Assign User(s)
      </PermissionButton>

      {/* 🔍 Search */}
      <AppSearch
        placeholder="Search by  User Name"
        onSearch={handleSearch}
        defaultValue={search}
        className="max-w-md"
      />

      {isPending && <LoadingPage />}

      {/* Data Table */}
      <DataTable
        data={shopUsers}
        columns={[
          { key: 'shop', label: 'Shop Name' },
          { key: 'user', label: 'User Name' },
          {
            key: 'actions',
            label: 'Actions',
            className: 'text-center',
            render: (item) => (
              <div className="space-x-2 text-center">
                <PermissionButton
                  size="sm"
                  variant="destructive"
                  permission="Shops.Delete"
                  onClick={() => handleDelete(item as ShopUser)}
                >
                  Delete
                </PermissionButton>
              </div>
            ),
          },
        ]}
      />

      {/* Dialog for assigning multiple users */}
      <ShopUserDialog
        open={open}
        setOpen={setOpen}
        onSubmit={handleCreate}
        users={initialUser}
        assignedUsers={shopUsers}
      />


      {/* ✅ Pagination */}
      {
        shopUsers.length > 0 && pageNumber < totalPages && (
          <div className="flex justify-end pt-4">
            <AppPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )
      }

    </div>
  );
}
