"use client";

import { useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { ShopUser } from "@/types/shopUser";
import { Users } from "@/types/user";

interface ShopUserDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onSubmit: (shopId: string,user: string[]) => Promise<void> | void;
    shopUser?: ShopUser | null;
    users: Users[] | undefined;
    assignedUsers?: ShopUser[];
}

export default function ShopUserDialog({
    open,
    setOpen,
    onSubmit,
    shopUser,
    users,
    assignedUsers,
}: ShopUserDialogProps) {
    const { hasPermission } = usePermission();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<{
        shopId: string;
        userId: string[];
    }>({
        mode: "onTouched",
        defaultValues: {
            shopId: shopUser?.shopId || "",
            userId: [],
        },
    });

    useEffect(() => {
        reset({
            shopId: shopUser?.shopId || "",
            userId: [],
        });
    }, [open, shopUser?.shopId, reset]);

    const onSubmitForm = useCallback(
        async (data: { shopId: string; userId: string[]; }) => {
            await onSubmit(data.shopId, data.userId);
            setOpen(false);
        },
        [onSubmit, setOpen]
    );

    const requiredPermission = shopUser ? "Shops.Update" : "Shops.Create";
    if (!hasPermission(requiredPermission)) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Multiple Users to Shop</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <Tabs defaultValue="select">
                        <TabsList className="grid grid-cols-1 mb-3">
                            <TabsTrigger value="select">Select Users</TabsTrigger>
                        </TabsList>

                        <TabsContent value="select" className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Select Users</Label>
                            <Controller
                                name="userId"
                                control={control}
                                render={({ field }) => {
                                    const selectedIds = field.value ?? [];
                                    const selectedUsers = (users ?? []).filter((u) =>
                                        selectedIds.includes(u.id)
                                    );

                                    // ✅ Exclude already assigned users
                                    const assignedIds =
                                        assignedUsers?.map((au) => au.userId.toLowerCase()) ?? [];

                                    // Only show users not selected AND not already assigned
                                    const availableUsers = (users ?? []).filter(
                                        (u) =>
                                            !selectedIds.includes(u.id) &&
                                            !assignedIds.includes(u.id.toLowerCase())
                                    );

                                    return (
                                        <div className="space-y-3">
                                            {/* Selected users */}
                                            <div className="flex flex-wrap gap-2 min-h-10 border rounded-md p-2">
                                                {selectedUsers.length > 0 ? (
                                                    selectedUsers.map((user) => (
                                                        <Badge
                                                            key={user.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1 px-2 py-1 text-sm"
                                                        >
                                                            {user.fullName}
                                                            <button
                                                                type="button"
                                                                title="Remove user"
                                                                aria-label={`Remove ${user.fullName}`}
                                                                onClick={() =>
                                                                    field.onChange(selectedIds.filter((id) => id !== user.id))
                                                                }
                                                                className="ml-1 text-gray-500 hover:text-red-500"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">No users selected</span>
                                                )}
                                            </div>

                                            {/* Searchable dropdown */}
                                            <Command className="border rounded-md">
                                                <CommandInput placeholder="Search users..." />
                                                <ScrollArea className="h-48">
                                                    <CommandList>
                                                        {availableUsers.length > 0 ? (
                                                            availableUsers.map((u) => (
                                                                <CommandItem
                                                                    key={u.id}
                                                                    onSelect={() => field.onChange([...selectedIds, u.id])}
                                                                >
                                                                    {u.fullName}
                                                                </CommandItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-sm text-gray-400">
                                                                All users already assigned.
                                                            </div>
                                                        )}
                                                    </CommandList>
                                                </ScrollArea>
                                            </Command>
                                        </div>
                                    );
                                }}
                            />

                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !hasPermission(requiredPermission)}
                        >
                            {isSubmitting ? "Assigning..." : "Assign Users"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
