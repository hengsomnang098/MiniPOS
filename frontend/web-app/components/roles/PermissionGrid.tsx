"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";

interface PermissionOption {
    id: string;
    label: string;
}

interface PermissionGridProps {
    groupedPermissions: Record<string, PermissionOption[]>;
    register: UseFormRegister<any>;
    errors: FieldErrors;
}

export function PermissionGrid({
    groupedPermissions,
    register,
    errors,
}: PermissionGridProps) {
    return (
        <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, options]) => (
                <div
                    key={category}
                    className="rounded-lg border p-4 shadow-sm bg-card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold capitalize">{category}</h4>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                className="flex-none"
                            >
                                <label
                                    className="inline-flex items-center hover:bg-accent transition rounded-md p-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={option.id}
                                        {...register("permissionIds", {
                                            required: "At least one permission must be selected",
                                        })}
                                        className="h-4 w-4 accent-primary mr-2"
                                    />
                                    <span className="text-sm whitespace-nowrap">{option.label}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {errors.permissionIds && (
                <p className="text-sm text-red-500">
                    {errors.permissionIds.message as string}
                </p>
            )}
        </div>
    );
}
