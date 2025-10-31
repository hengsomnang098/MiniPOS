"use client";
import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormDialog } from "@/components/form/FormDialog";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { usePermission } from "@/hooks/usePermission";
import { Services } from "@/types/service";
import { Categories } from "@/types/category";

interface ServiceFormDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onSubmit: (data: Partial<Services>) => Promise<void> | void;
    service?: Services | null;
    categories: Categories[];
}

export default function ServiceFormDialog(
    { open, setOpen, onSubmit, service, categories }: ServiceFormDialogProps) {

    const { hasPermission } = usePermission();

    const { control, handleSubmit, setFocus, reset, formState: { isSubmitting, isValid, isDirty, errors }, } = useForm<Partial<Services>>({
        mode: "onTouched",
        defaultValues: {
            name: service?.name || "",
            categoryId: service?.categoryId || "",
        },
    });

    useEffect(() => {
        reset({
            name: service?.name || "",
            categoryId: service?.categoryId || "",
        });
        if (open) setFocus("name");
    }, [open, reset, setFocus, service]);

    const onSubmitForm = useCallback(async (data: Partial<Services>) => {
        await onSubmit(data);
        setOpen(false);
        reset();
    }, [onSubmit, setOpen, reset]);

    const requiredPermission = service ? "Services.Update" : "Services.Create";

    if (!hasPermission(requiredPermission)) {
        return null;
    }

    return (
        <>
            <FormDialog
                title={service ? "Edit Service" : "Add Service"}
                open={open}
                setOpen={setOpen}
                onSubmit={handleSubmit(onSubmitForm)}
                disabled={isSubmitting || !isDirty || !isValid}
                submitLabel={service ? "Update Service" : "Create Service"}
            >
                <div className="space-y-4">
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Service name is required." }}
                        render={({ field }) => (
                            <FormInput
                                id="name"
                                label="Service Name"
                                placeholder="Enter service name"
                                register={field}
                                error={errors.name}
                            />
                        )}
                    />
                    <Controller
                        name="categoryId"
                        control={control}
                        rules={{ required: "Category is required." }}
                        render={({ field }) => (
                            <FormSelect
                                id="categoryId"
                                label="Category"
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Select category"
                                options={categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.categoryName,
                                }))}
                                error={errors.categoryId}
                            />
                        )}
                    />
                </div>
            </FormDialog>
        </>
    )
}
