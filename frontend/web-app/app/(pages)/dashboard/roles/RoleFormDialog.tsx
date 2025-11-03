"use client";

import CheckboxField from '@/components/form/CheckboxField';
import { FormDialog } from '@/components/form/FormDialog';
import { FormInput } from '@/components/form/FormInput';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/types/permission';
import { Roles } from '@/types/role';
import React, { useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form';

interface RoleFormDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
  role?: Roles | null;
  permissions: Permissions[];
}

export default function RoleFormDialog({ open, setOpen, onSubmit, role, permissions }: RoleFormDialogProps) {
  const { hasPermission } = usePermission();

  const form = useForm<Partial<Roles>>({
    mode: "onTouched",
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      permissionIds: role?.permissions?.map(p => p.id) || [],
    },
  });

  const { control, handleSubmit, setFocus, reset, formState: { isSubmitting, isValid, isDirty, errors } } = form;

  useEffect(() => {
    reset({
      name: role?.name || "",
      description: role?.description || "",
      permissionIds: role?.permissions?.map(p => p.id) || [],
    });
    if (open) setFocus("name");
  }, [role, open, reset, setFocus]);

  const onSubmitForm = useCallback(async (data: Partial<Roles>) => {
    await onSubmit(data);
    setOpen(false);
    reset();
  }, [onSubmit, reset, setOpen]);

  const requiredPermission = role ? "Roles.Update" : "Roles.Create";
  if (!hasPermission(requiredPermission)) return null;

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    const [category] = permission.name.split('.');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: permission.id,
      label: permission.name
    });
    return acc;
  }, {} as Record<string, Array<{ id: string, label: string }>>);

  return (
    <FormDialog
      open={open}
      setOpen={setOpen}
      onSubmit={handleSubmit(onSubmitForm)}
      title={role ? "Edit Role" : "Create Role"}
      isSubmitting={isSubmitting}
      disabled={!isDirty || !isValid || !hasPermission(requiredPermission)}
      submitLabel={role ? "Update Role" : "Create Role"}

    >
      <Controller
        name="name"
        control={control}
        rules={{ required: "Role name is required" }}
        render={({ field }) => (
          <FormInput
            id="name"
            label="Role Name"
            placeholder="Enter role name"
            register={field}
            error={errors.name}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        rules={{
          required:"Description is required"
        }}
        render={({ field }) => (
          <FormInput
            id="description"
            label="Description"
            placeholder="Enter role description"
            register={field}
            error={errors.description}
          />
        )}
      />

      <Controller
        name="permissionIds"
        control={control}
        render={({ field }) => {
          const { value = [], onChange } = field;

          const handleToggle = (id: string) => {
            const currentValue = Array.isArray(value) ? value : [];
            const newValue = currentValue.includes(id)
              ? currentValue.filter((v: string) => v !== id)
              : [...currentValue, id];
            onChange(newValue);
          };

          return (
            <div className="space-y-6 mt-4">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className=' border p-4 rounded-md'>
                  <h4 className="text-sm font-bold mb-2">{group}</h4>
                  <hr  className='mb-2'/>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <CheckboxField
                        key={perm.id}
                        control={control}
                        name={`perm_${perm.id}`}
                        label={perm.label}
                        checked={Array.isArray(value) && value.includes(perm.id)}
                        onCheckedChange={() => handleToggle(perm.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      />



    </FormDialog>
  );
}
