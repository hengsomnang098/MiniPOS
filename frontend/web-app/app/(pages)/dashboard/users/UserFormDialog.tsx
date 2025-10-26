"use client";

import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Users } from "@/types/user";
import { Roles } from "@/types/role";
import { FormDialog } from "@/components/form/FormDialog";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { usePermission } from "@/hooks/usePermission";

interface UserFormDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onSubmit: (data: Partial<Users>) => Promise<void> | void;
    user?: Users | null;
    roles: Roles[];
}

export function UserFormDialog({
    open,
    setOpen,
    onSubmit,
    user,
    roles,
}: UserFormDialogProps) {
    const { hasPermission } = usePermission();


    const { control, handleSubmit, setFocus, reset, formState: { isSubmitting, isValid, isDirty, errors }, } = useForm<Partial<Users>>({
        mode: "onTouched",
        defaultValues: {
            fullName: user?.fullName || "",
            email: user?.email || "",
            roleId: user?.roleId || "",
            password: ""
        },
    });

    useEffect(() => {
        reset({
            fullName: user?.fullName || "",
            email: user?.email || "",
            roleId: user?.roleId || "",
            password: ""
        });
        if (open) setFocus("fullName");
    }, [user, open, reset, setFocus]);

    const onSubmitForm = useCallback(async (data: Partial<Users>) => {
        await onSubmit(data);
        setOpen(false);
        reset();
    }, [onSubmit, setOpen, reset]);

    // ✅ Define required permission based on mode
    const requiredPermission = user ? "Users.Update" : "Users.Create";

    // ❌ If user has no permission to create or edit, hide form entirely
    if (!hasPermission(requiredPermission)) {
        return null; // or show a warning like <p>No permission to manage users</p>
    }

    return (
        <FormDialog
            open={open}
            setOpen={setOpen}
            title={user ? "Edit User" : "Add New User"}
            onSubmit={handleSubmit(onSubmitForm)}
            isSubmitting={isSubmitting}
            // ✅ Disable submit button if invalid or lacks permission
            disabled={!isDirty || !isValid || !hasPermission(requiredPermission)}
            submitLabel={user ? "Save Changes" : "Create User"}
        >
            <Controller
                name="fullName"
                control={control}
                rules={{
                    required: "Full Name is required",
                    pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: "Full Name can only contain letters and spaces",
                    }
                }}
                render={({ field }) => (
                    <FormInput
                        id="fullName"
                        label="Full Name"
                        placeholder="Enter full name"
                        register={field}
                        error={errors.fullName}
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                rules={{
                    required: "Email is required",
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                    },
                }}
                render={({ field }) => (
                    <FormInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email"
                        register={field}
                        error={errors.email}
                    />
                )}
            />
            <Controller
                name="password"
                control={control}
                rules={{
                    required: user ? false : "Password is required", // Only required for new users
                    minLength: { value: 6, message: "Must be at least 6 characters" },
                }}
                render={({ field }) => (
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        register={field}
                        error={errors.password}
                    />
                )}
            />

            <Controller
                name="roleId"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                    <FormSelect
                        id="roleId"
                        label="Role"
                        value={field.value}
                        onChange={field.onChange}
                        options={roles.map((r) => ({ label: r.name, value: r.id }))}
                        error={errors.roleId}
                        placeholder="Select a role"
                    />
                )}
            />
        </FormDialog>
    );
}
