"use client";

import React from "react";
import type { OrderDto } from "@/types/order";

interface OrderInvoiceProps {
  order: OrderDto;
}

export function OrderInvoice({ order }: OrderInvoiceProps) {
  const shortId = order.id?.slice(0, 8) ?? "";
  const date = order.orderDate ? new Date(order.orderDate) : new Date();

  return (
    <div className="mx-auto w-full max-w-md print:max-w-full bg-white text-black">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-3">
        <h2 className="text-lg font-semibold">Invoice</h2>
        <div className="text-xs text-gray-600">Order #{shortId}</div>
        <div className="text-xs text-gray-600">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      </div>

      {/* Items */}
      <div className="mt-3">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Sub</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((it, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 pr-2">
                  <div className="font-medium">{it.productName}</div>
                </td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">${it.unitPrice.toFixed(2)}</td>
                <td className="py-2 text-right">${it.subTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-3 border-t border-gray-200 pt-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold text-base">
          <span>Grand Total</span>
          <span>${order.finalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Status</span>
          <span className="uppercase">{order.status}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Thank you for your purchase.
      </div>
    </div>
  );
}
