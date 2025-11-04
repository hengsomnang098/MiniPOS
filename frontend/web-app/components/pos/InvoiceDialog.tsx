"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/hooks/useCartStore";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  onConfirm: () => Promise<void> | void;
  confirming?: boolean;
}

export default function InvoiceDialog({ open, onOpenChange, items, subtotal, discount, total, onConfirm, confirming }: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Sub</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.productId} className="border-b">
                  <td className="py-2 pr-2">
                    <div className="font-medium line-clamp-1">{i.name}</div>
                  </td>
                  <td className="py-2 text-center">{i.quantity}</td>
                  <td className="py-2 text-right">${i.price.toFixed(2)}</td>
                  <td className="py-2 text-right">${(i.price * i.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>Cancel</Button>
          <Button className="btn-deep-ocean" onClick={() => onConfirm()} disabled={confirming}>
            {confirming ? "Processing..." : "Confirm & Print"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
