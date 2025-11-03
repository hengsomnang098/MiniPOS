"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getShopByUser } from "@/app/actions/shopUserAction";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SelectShopModalProps {
    userId: string;
    onSelect: (shopId: string) => void;
}

export default function SelectShopModal({ userId, onSelect }: SelectShopModalProps) {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<string | undefined>();
    const [open, setOpen] = useState(true);

    useEffect(() => {
        async function fetchShops() {
            setLoading(true);
            try {
                const data = await getShopByUser(userId);
                setShops(data || []);
            } catch (err) {
                console.error("Failed to fetch shops:", err);
                setShops([]);
            } finally {
                setLoading(false);
            }
        }

        fetchShops();
    }, [userId]);

    const handleConfirm = () => {
        if (selectedShop) {
            onSelect(selectedShop);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                        Select a Shop
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <p className="text-center py-6 text-sm text-gray-500">Loading shops...</p>
                ) : shops.length === 0 ? (
                    <p className="text-center py-6 text-sm text-gray-500">
                        No shops available for your account.
                    </p>
                ) : (
                    <div className="space-y-4 mt-4">
                        <Select
                            onValueChange={(value) => setSelectedShop(value)}
                            value={selectedShop}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose your shop..." />
                            </SelectTrigger>
                            <SelectContent>
                                {shops.map((shop) => (
                                    <SelectItem key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedShop}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            Confirm
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
