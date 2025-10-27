'use client';

import React, { useState, useTransition } from 'react';
import { ShopUser } from '@/types/shopUser';
import { Users } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { PermissionButton } from '@/components/permissionButton/PermissionButton';
import LoadingPage from '../../loading';
import { assignUsersToShop, removeUserFromShop } from '@/app/actions/shopUserAction';
// import ShopUserDialog from './ShopUserDialog';
import { DataTable } from '@/components/DataTable';
import dynamic from 'next/dynamic';

const ShopUserDialog = dynamic(() => import('./ShopUserDialog').then(m => m.default), {
  ssr: false,
  loading: () => <LoadingPage />,
});

interface ShopUsersListProps {
  initialShopUser: ShopUser[];
  initialUser?: Users[];
  shopUserId?: string;
}


export default function ShopUsersList({ initialShopUser, initialUser, shopUserId }: ShopUsersListProps) {
  const [shopUsers, setShopUsers] = useState(initialShopUser);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  /**
   * Assign one or more users to the current shop
   */
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

      {isPending && <LoadingPage />}

      {/* Data Table */}
      <DataTable
        data={shopUsers}
        columns={[
          { key: 'shopId', label: 'Shop ID' },
          { key: 'shop', label: 'Shop Name' },
          { key: 'userId', label: 'User ID' },
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

    </div>
  );
}
