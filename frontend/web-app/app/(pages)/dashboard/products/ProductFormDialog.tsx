"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormDialog } from "@/components/form/FormDialog";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import CheckboxField from "@/components/form/CheckboxField";
import { usePermission } from "@/hooks/usePermission";
import { Product } from "@/types/product";
import { FormImage } from "@/components/form/FormImage";
import { FormSelect } from "@/components/form/FormSelect";
import { getAllCategories } from "@/app/actions/categoryAction";
import { getServices } from "@/app/actions/servicesAction";
import { Categories } from "@/types/category";
import { Services } from "@/types/service";

interface ProductFormDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onSubmit: (data: FormData) => Promise<void> | void;
    product?: Product | null;
    shopId: string;
}

export function ProductFormDialog({
    open,
    setOpen,
    onSubmit,
    product,
    shopId,
}: ProductFormDialogProps) {
    const { hasPermission } = usePermission();
    const isEditing = !!product;

    const {
        control,
        handleSubmit,
        reset,
        setFocus,
        setValue,
        watch,
        formState: { isSubmitting, isValid, isDirty, errors },
    } = useForm<Partial<Product>>({
        mode: "onTouched",
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            costPrice: product?.costPrice || 0,
            quantity: product?.quantity || 0,
            serviceId: product?.serviceId || "",
            isActive: product?.isActive ?? true,
        },
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        product?.imageUrl || null
    );

    const [categories, setCategories] = useState<Categories[]>([]);
    const [services, setServices] = useState<Services[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    // 🧭 Load categories on open
    useEffect(() => {
        if (open && shopId) {
            getAllCategories(shopId)
                .then((data) => {
                    setCategories(data);
                    // Preselect category when editing
                    if (product?.categoryId) {
                        setSelectedCategory(product.categoryId);
                    }
                })
                .catch((e) => console.error("Load categories failed", e));
        }
    }, [open, shopId, product?.categoryId]);

    // 🧭 Load services when category changes
    useEffect(() => {
        if (!selectedCategory) return;
        const fetchServices = async () => {
            try {
                const result = await getServices(`categoryId=${selectedCategory}`, shopId);
                setServices(result.items || []);
            } catch (err) {
                console.error("Fetch services failed", err);
            }
        };
        fetchServices();
    }, [selectedCategory, shopId]);

    // 🧭 When opening in edit mode, ensure category is selected so services load
    useEffect(() => {
        if (open && isEditing && product?.categoryId) {
            setSelectedCategory(product.categoryId);
        }
    }, [open, isEditing, product?.categoryId]);

    // 🧼 Reset form when dialog opens
    useEffect(() => {
        reset({
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            costPrice: product?.costPrice || 0,
            quantity: product?.quantity || 0,
            serviceId: product?.serviceId || "",
            isActive: product?.isActive ?? true,
        });
        setImagePreview(product?.imageUrl || null);
        setSelectedFile(null);
        // Preselect category when editing
        setSelectedCategory(product?.categoryId || "");
        if (open) setFocus("name");
    }, [open, product, reset, setFocus]);

    // ✅ Submit handler
    const onSubmitForm = useCallback(
        async (data: Partial<Product>) => {
            const formData = new FormData();
            formData.append("Name", data.name || ""); // ✅ match DTO casing
            formData.append("Description", data.description || "");
            formData.append("Price", String(data.price ?? 0));
            formData.append("CostPrice", String(data.costPrice ?? 0));
            formData.append("Quantity", String(data.quantity ?? 0));
            formData.append("ServiceId", data.serviceId || ""); // ✅ GUID value required
            formData.append("IsActive", String(data.isActive ?? true));

            if (selectedFile) {
                formData.append("ImageUrl", selectedFile); // ✅ match DTO property name
            }

            console.group("🧾 Product Form Data Preview");
            for (const [key, value] of formData.entries()) console.log(`${key}:`, value);
            console.groupEnd();

            await onSubmit(formData);
            setOpen(false);
            reset();
            setSelectedFile(null);
            setImagePreview(null);
        },
        [onSubmit, reset, setOpen, selectedFile]
    );


    const requiredPermission = isEditing ? "Products.Update" : "Products.Create";
    if (!hasPermission(requiredPermission)) return null;

    const price = watch("price");
    const costPrice = watch("costPrice");
    const quantity = watch("quantity");

    return (
        <FormDialog
            open={open}
            setOpen={setOpen}
            className="max-w-5xl"
            title={isEditing ? "Edit Product" : "Add New Product"}
            onSubmit={handleSubmit(onSubmitForm)}
            isSubmitting={isSubmitting}
            disabled={!isDirty || !isValid || !hasPermission(requiredPermission)}
            submitLabel={isEditing ? "Save Changes" : "Create Product"}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                {/* LEFT SIDE */}
                <div className="space-y-5">
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Product Name is required" }}
                        render={({ field }) => (
                            <FormInput
                                id="name"
                                label="Product Name"
                                placeholder="Enter product name"
                                register={field}
                                error={errors.name}
                            />
                        )}
                    />

                    {/* Category Select */}
                    <FormSelect
                        id="category"
                        label="Category"
                        placeholder="Select category"
                        value={selectedCategory}
                        onChange={(value: string) => {
                            setSelectedCategory(value);
                            setServices([]);
                            // Clear any previously selected service when category changes
                            setValue("serviceId", "", { shouldDirty: true, shouldValidate: true });
                        }}
                        options={categories.map((cat) => ({
                            label: cat.categoryName,
                            value: cat.id,
                        }))}
                    />

                    {/* Service Select */}
                    <Controller
                        name="serviceId"
                        control={control}
                        rules={{ required: "Service is required" }}
                        render={({ field }) => (
                            <FormSelect
                                id="serviceId"
                                label="Service"
                                placeholder="Select service"
                                value={field.value}
                                onChange={(value: string) => field.onChange(value)}
                                options={services.map((svc) => ({
                                    label: svc.name,
                                    value: svc.id, // ✅ send serviceId
                                }))}
                                disabled={!selectedCategory || services.length === 0}
                                error={errors.serviceId}
                            />
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <FormTextarea
                                id="description"
                                label="Description"
                                placeholder="Enter product description"
                                register={field}
                                error={errors.description}
                                rows={4}
                            />
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="price"
                            control={control}
                            rules={{
                                required: "Price is required",
                                min: { value: 0, message: "Price cannot be negative" },
                            }}
                            render={({ field }) => (
                                <FormInput
                                    id="price"
                                    label="Selling Price"
                                    type="number"
                                    placeholder="Enter price"
                                    register={field}
                                    error={errors.price}
                                />
                            )}
                        />

                        <Controller
                            name="costPrice"
                            control={control}
                            rules={{
                                required: "Cost price is required",
                                min: { value: 0, message: "Cost cannot be negative" },
                            }}
                            render={({ field }) => (
                                <FormInput
                                    id="costPrice"
                                    label="Cost Price"
                                    type="number"
                                    placeholder="Enter cost"
                                    register={field}
                                    error={errors.costPrice}
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="quantity"
                        control={control}
                        rules={{
                            required: "Quantity is required",
                            min: { value: 0, message: "Quantity cannot be negative" },
                        }}
                        render={({ field }) => (
                            <FormInput
                                id="quantity"
                                label="Quantity"
                                type="number"
                                placeholder="Enter quantity"
                                register={field}
                                error={errors.quantity}
                            />
                        )}
                    />

                    <CheckboxField
                        control={control}
                        name="isActive"
                        label="Product is Active"
                        description="Uncheck to deactivate this product"
                        className="pt-2"
                    />

                    {(price || costPrice || quantity) && (
                        <div className="mt-4 text-sm text-muted-foreground text-center">
                            <p>
                                <span className="font-medium">Price:</span> ${price ?? 0} |{" "}
                                <span className="font-medium">Cost:</span> ${costPrice ?? 0} |{" "}
                                <span className="font-medium">Qty:</span> {quantity ?? 0}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE — Image */}
                <div className="flex flex-col justify-start">
                    <FormImage
                        label="Product Image"
                        initialPreview={imagePreview}
                        onFileSelect={(file, preview) => {
                            setSelectedFile(file);
                            setImagePreview(preview);
                        }}
                        height={320}
                    />
                </div>
            </div>
        </FormDialog>
    );
}
