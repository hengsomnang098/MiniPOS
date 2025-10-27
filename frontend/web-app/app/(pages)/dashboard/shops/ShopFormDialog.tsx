"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Shops } from "@/types/shop";
import { FormDialog } from "@/components/form/FormDialog";
import { FormInput } from "@/components/form/FormInput";
import CheckboxField from "@/components/form/CheckboxField";
import { usePermission } from "@/hooks/usePermission";
import { addMonths, format, formatISO, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Users } from "@/types/user";
import { FormSelect } from "@/components/form/FormSelect";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopFormDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: (data: Partial<Shops>) => Promise<void> | void;
  shop?: Shops | null;
  users: Users[] | undefined;
}

export function ShopFormDialog({
  open,
  setOpen,
  onSubmit,
  shop,
  users,
}: ShopFormDialogProps) {
  const { hasPermission } = usePermission();

  const {
    control,
    handleSubmit,
    setFocus,
    reset,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, isValid, isDirty, errors },
  } = useForm<Partial<Shops>>({
    mode: "onTouched",
    defaultValues: {
      name: shop?.name || "",
      userId: shop?.userId || "",
      subscriptionStartDate: shop?.subscriptionStartDate || "",
      subscriptionEndDate: shop?.subscriptionEndDate || "",
      isActive: shop?.isActive ?? true,
    },
  });
  

  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);

  // Set default state on open
  useEffect(() => {
    reset({
      name: shop?.name || "",
      userId: shop?.userId || "",
      subscriptionStartDate: shop?.subscriptionStartDate || "",
      subscriptionEndDate: shop?.subscriptionEndDate || "",
      isActive: shop?.isActive ?? true,
    });
    // Reset selectedMonths when switching between add/edit
    setSelectedMonths(null);
    if (open) setFocus("name");
  }, [shop, open, reset, setFocus]);

  const handleSelectDuration = useCallback(
    (months: number) => {
      const startValue = getValues("subscriptionStartDate")
        ? new Date(getValues("subscriptionStartDate") as string)
        : startOfDay(new Date());

      const end = startOfDay(addMonths(startValue, months));

      setValue("subscriptionEndDate", formatISO(end), { shouldDirty: true });
      setSelectedMonths(months);
    },
    [setValue, getValues]
  );

  const onSubmitForm = useCallback(
    async (data: Partial<Shops>) => {
      if (!data.subscriptionStartDate) {
        // Default start date if not picked
        const today = startOfDay(new Date());
        setValue("subscriptionStartDate", formatISO(today));
      }
      if (!data.subscriptionEndDate) {
        handleSelectDuration(selectedMonths ?? 12);
      }

      const payload = getValues();
      await onSubmit(payload);
      setOpen(false);
      reset();
    },
    [onSubmit, selectedMonths, setValue, handleSelectDuration, reset, setOpen, getValues]
  );

  const requiredPermission = shop ? "Shops.Update" : "Shops.Create";
  if (!hasPermission(requiredPermission)) return null;

  const subStart = watch("subscriptionStartDate");
  const subEnd = watch("subscriptionEndDate");

  return (
    <FormDialog
      open={open}
      setOpen={setOpen}
      title={shop ? "Edit Shop" : "Add New Shop"}
      onSubmit={handleSubmit(onSubmitForm)}
      isSubmitting={isSubmitting}
      disabled={!isDirty || !isValid || !hasPermission(requiredPermission)}
      submitLabel={shop ? "Save Changes" : "Create Shop"}
    >
      {/* Shop Name */}
      <Controller
        name="name"
        control={control}
        // rules={{ required: "Shop Name is required" }}
        render={({ field }) => (
          <FormInput
            id="name"
            label="Shop Name"
            placeholder="Enter shop name"
            register={field}
            error={errors.name}
          />
        )}
      />

      {/* Owner */}
      <Controller
        name="userId"
        control={control}
        rules={{ required: "Owner is required" }}
        render={({ field }) => (
          <FormSelect
            id="userId"
            label="Owner"
            value={field.value}
            onChange={field.onChange}
            options={(users ?? []).map((u) => ({
              label: u.fullName,
              value: u.id,
            }))}
            error={errors.userId}
            placeholder="Select owner"
          />
        )}
      />

      {/* Subscription Start Date */}
      <Controller
        name="subscriptionStartDate"
        control={control}
        rules={{ required: "Start date is required" }}
        render={({ field }) => (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(new Date(field.value), "yyyy-MM-dd")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(formatISO(startOfDay(date)));
                      if (selectedMonths)
                        setValue(
                          "subscriptionEndDate",
                          formatISO(addMonths(startOfDay(date), selectedMonths)),
                          { shouldDirty: true }
                        );
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.subscriptionStartDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.subscriptionStartDate.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Subscription Duration */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Select Subscription Duration:</p>
        <div className="flex gap-2 justify-around">
          {[3, 6, 12].map((m) => (
            <Button
              key={m}
              type="button"
              variant={selectedMonths === m ? "default" : "outline"}
              className={selectedMonths === m ? "bg-cyan-500 text-white" : ""}
              onClick={() => handleSelectDuration(m)}
            >
              {m} Months
            </Button>
          ))}
        </div>

        {subStart && subEnd && (
          <div className="mt-3 text-sm text-center text-muted-foreground">
            <p>
              <span className="font-medium">Start:</span>{" "}
              {format(new Date(subStart), "yyyy-MM-dd")}
            </p>
            <p>
              <span className="font-medium">End:</span>{" "}
              {format(new Date(subEnd), "yyyy-MM-dd")}
            </p>
          </div>
        )}
      </div>

      {/* Active Checkbox */}
      <CheckboxField
        control={control}
        name="isActive"
        label="Shop is Active"
        description="Uncheck to deactivate this shop"
      />
    </FormDialog>
  );
}
