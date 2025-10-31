"use client";

import { usePermission } from "@/hooks/usePermission";
import { Categories } from "@/types/category";
import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormDialog } from '@/components/form/FormDialog';
import { FormInput } from '@/components/form/FormInput';

interface CategoriesFormDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onSubmit: (data: any) => Promise<void> | void;
    category?: Categories | null;
}

export default function CategoriesFormDialog({ open, setOpen, onSubmit, category }: CategoriesFormDialogProps) {
    const { hasPermission } = usePermission();

    const form = useForm<Partial<Categories>>({
        mode: "onTouched",
        defaultValues: {
            categoryName: category?.categoryName || "",
        },
    });

    const { handleSubmit, setFocus, reset, formState: { isSubmitting, isValid, isDirty, errors } } = form;

    useEffect(() => {
        reset({
            categoryName: category?.categoryName || "",
        });
        if (open) setFocus("categoryName");
    }, [category, open, reset, setFocus]);

    const onSubmitForm = useCallback(async (data: Partial<Categories>) => {
        await onSubmit(data);
        setOpen(false);
        reset();
    }, [onSubmit, reset, setOpen]);

    const requiredPermission = category ? "Categories.Update" : "Categories.Create";
    if (!hasPermission(requiredPermission)) return null;


    return (
        (
            <FormDialog
                open={open}
                setOpen={setOpen}
                title={category ? "Edit Category" : "Create Category"}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmitForm)}
                disabled={!isDirty || !isValid || !hasPermission(requiredPermission)}
                submitLabel={category ? "Update Category" : "Create Category"}

            >
                <Controller
                    name="categoryName"
                    control={form.control}
                    rules={{ required: "Category name is required." }}
                    render={({ field }) => (
                        <FormInput
                            id="categoryName"
                            label="Category Name"
                            placeholder="Enter category name"
                            register={field}
                            error={errors.categoryName}

                        />
                    )}
                />
            </FormDialog>
        )
    )
}
