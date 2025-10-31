'use client'
import { PermissionButton } from "@/components/permissionButton/PermissionButton"
import LoadingPage from "../loading"
import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/DataTable"
import { Services } from "@/types/service"
import { Categories } from "@/types/category"
import { createService, deleteService, updateService } from "@/app/actions/servicesAction"
import ServiceFormDialog from "./ServiceFormDialog"

interface ServicesListProps {
    initialServices: Services[]
    initialCategories: Categories[]
}

export default function ServicesList({ initialServices, initialCategories }: ServicesListProps) {
    const [services, setServices] = useState(initialServices);
    const [open, setOpen] = useState(false);
    const [editingService, setEditingService] = useState<Services | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    async function handleCreate(data: Partial<Services>) {
        const result = await createService(data);
        startTransition(async () => {

            if (result && !('error' in result)) {
                setServices((prev) => [...prev, result]);
                toast({
                    title: "✅ Service Created",
                    description: `${result.name} added successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Create Service",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }

    async function handleUpdate(id: string, data: Partial<Services>) {
        const result = await updateService(id, {...data,id});
        startTransition(async () => {

            if (result && !('error' in result)) {
                setServices((prev) => prev.map((service) => service.id === id ? result : service));
                toast({
                    title: "✅ Service Updated",
                    description: `${result.name} updated successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Update Service",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }

    async function handleDelete(id: string) {
        const result = await deleteService(id);
        startTransition(async () => {

            if (result) {
                setServices((prev) => prev.filter((service) => service.id !== id));
                toast({
                    title: "✅ Service Deleted",
                    description: `Service deleted successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Delete Service",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center" >
                <h2 className="text-lg font-medium">All Categories</h2>
                <PermissionButton
                    permission="Services.Create"
                    className="bg-cyan-500"
                    onClick={() => {
                        setEditingService(null);
                        setOpen(true);
                    }}
                >
                    + Add Service
                </PermissionButton>
            </div >

            {isPending && <LoadingPage />}

            <DataTable
                data={services}
                columns={[
                    {key:"name",label:"Service Name"},
                    {key:"category",label:"Category Name"},
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-right",
                        render: (services) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Services.Update"
                                    className="bg-yellow-500 hover:bg-yellow-300"
                                    onClick={() => {
                                        setEditingService(services);
                                        setOpen(true);
                                    }}
                                >
                                    Edit
                                </PermissionButton>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <PermissionButton
                                            size="sm"
                                            variant="destructive"
                                            permission="Services.Delete"
                                        >
                                            Delete
                                        </PermissionButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently remove <strong>{(services).name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(services.id)}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ),
                    },
                ]}
            />

            <ServiceFormDialog
                open={open}
                setOpen={setOpen}
                onSubmit={editingService ? (data) => handleUpdate(editingService.id, data) : handleCreate}
                service={editingService}
                categories={initialCategories}
            />
        </div>
    )
}
