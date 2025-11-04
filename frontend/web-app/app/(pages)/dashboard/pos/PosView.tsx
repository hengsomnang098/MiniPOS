"use client";

import { useState, useTransition } from "react";
import { PageResult } from "@/types/pageResult";
import { Product } from "@/types/product";
import { Categories } from "@/types/category";
import { AppSearch } from "@/components/AppSearch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useCartStore } from "@/hooks/useCartStore";
import { useToast } from "@/components/ui/use-toast";
import { getProductsByShop } from "@/app/actions/productAction";
import { getProductByBarcode } from "@/app/actions/productAction";
import AppPagination from "@/components/AppPagination";
import { createOrder } from "@/app/actions/orderAction";
import { usePermission } from "@/hooks/usePermission";
import InvoiceDialog from "@/components/pos/InvoiceDialog";
import { useRouter } from "next/navigation";

interface PosViewProps {
  initialProducts: PageResult<Product>;
  shopId: string;
  categories: Categories[];
}

export default function PosView({ initialProducts, shopId, categories }: PosViewProps) {
  const [result, setResult] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [barcode, setBarcode] = useState("");
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const router = useRouter();

  const {
    items,
    addProduct,
    removeItem,
    increase,
    decrease,
    setQuantity,
    clear,
    discount,
    setDiscount,
    subtotal,
    finalTotal,
  } = useCartStore();

  async function refresh(page = result.pageNumber, term = searchTerm, categoryId = selectedCategoryId) {
    const query = `?page=${page}&pageSize=${result.pageSize}`
      + `${term ? `&search=${encodeURIComponent(term)}` : ""}`
      + `${categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ""}`;
    const res = await getProductsByShop(query, shopId);
    if (!res || res.isSuccess === false) {
      toast({ title: "Failed to load products", variant: "destructive" });
      return;
    }
    setResult(res);
  }

  async function handleSearch(term: string) {
    setSearchTerm(term);
    startTransition(() => refresh(1, term, selectedCategoryId));
  }

  async function handleBarcodeEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const code = barcode.trim();
    if (!code) return;
    try {
      const res = await getProductByBarcode(code, shopId);
      if (!res || res.isSuccess === false || !res.id) {
        toast({ title: "Not found", description: `No product for barcode ${code}`, variant: "destructive" });
        return;
      }
      addProduct(res);
      setBarcode("");
    } catch (err) {
      toast({ title: "Lookup failed", description: String(err), variant: "destructive" });
    }
  }

  function handleCategoryChange(categoryId: string | null) {
    setSelectedCategoryId(categoryId);
    startTransition(() => refresh(1, searchTerm, categoryId));
  }

  async function handleCheckout() {
    if (!hasPermission(["Orders.Create"])) {
      toast({ title: "Permission denied", description: "You cannot create orders.", variant: "destructive" });
      return;
    }

    if (items.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to cart first." });
      return;
    }
    // Open invoice preview dialog
    setShowInvoice(true);
  }

  async function confirmAndCreateOrder() {
    const payload = {
      shopId,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      discount,
    };

    try {
      setPlacing(true);
      const res = await createOrder(payload);
      if (res?.success === false || !res?.id) {
        const message = res?.message || res?.error || "Order failed";
        toast({ title: "Order failed", description: message, variant: "destructive" });
        return;
      }

      setShowInvoice(false);
      toast({ title: "Order placed", description: `Order #${res.id?.slice(0, 8)} created.` });

      // Navigate to order details
      router.push(`/dashboard/orders/${res.id}`);

      // Open print view in a new tab and trigger print there
      try {
        window.open(`/dashboard/orders/${res.id}/print`, "_blank");
      } catch {
        // ignore popup blockers silently
      }

      // Clear cart after placing order
      clear();
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Point of Sale</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Scan or enter barcode and press Enter"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeEnter}
            className="md:col-span-1"
            autoFocus
          />
          <div className="md:col-span-2">
            <AppSearch placeholder="Search products..." onSearch={handleSearch} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={selectedCategoryId ? "outline" : "default"}
            className={selectedCategoryId ? "btn-deep-ocean-outline" : "btn-deep-ocean"}
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              className={selectedCategoryId === c.id ? "btn-deep-ocean" : "btn-deep-ocean-outline"}
              onClick={() => handleCategoryChange(c.id)}
            >
              {c.categoryName}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {result.items.map((p, idx) => (
            <Card key={p.id} className="hover:shadow-sm transition">
              <CardContent className="p-3 space-y-2">
                <div className="relative w-full aspect-square rounded overflow-hidden bg-gray-50">
                  <Image
                    src={p.imageUrl || "/Images/placeholder.png"}
                    alt={p.name}
                    fill
                    /* Mark the first image as priority to improve LCP when it is above the fold */
                    priority={idx === 0}
                    /* Provide responsive sizes for images using fill to optimize loading */
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                <div className="text-xs text-gray-500 line-clamp-2 min-h-8">{p.description}</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">${p.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    className="btn-deep-ocean"
                    onClick={() => addProduct(p)}
                    disabled={p.quantity <= 0}
                  >
                    {p.quantity > 0 ? "Add" : "Out of stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <AppPagination
            currentPage={result.pageNumber}
            totalPages={result.totalPages}
            onPageChange={(p) => startTransition(() => refresh(p))}
          />
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Cart</h3>

            <ScrollArea className="h-[360px] pr-3">
              <div className="space-y-3">
                {items.length === 0 && (
                  <div className="text-sm text-gray-500">No items yet.</div>
                )}

                {items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={i.imageUrl || "/Images/placeholder.png"}
                        alt={i.name}
                        priority
                        width={100}
                        height={100}
                        className="object-cover aspect-auto"
                        // loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium line-clamp-1">{i.name}</div>
                      <div className="text-xs text-gray-500">${i.price.toFixed(2)} each</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Button size="sm" variant="outline" onClick={() => decrease(i.productId)}>-</Button>
                        <Input
                          type="number"
                          className="w-16 h-8"
                          value={i.quantity}
                          onChange={(e) => setQuantity(i.productId, Number(e.target.value))}
                          min={1}
                          max={i.stock}
                        />
                        <Button size="sm" variant="outline" onClick={() => increase(i.productId)}>+</Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${(i.price * i.quantity).toFixed(2)}</div>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => removeItem(i.productId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-2 border-t pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal().toFixed(2)}</span></div>
              <div className="flex items-center justify-between gap-2">
                <span>Discount</span>
                <Input
                  type="number"
                  className="w-32 h-8"
                  value={discount}
                  min={0}
                  max={subtotal()}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${finalTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="btn-deep-ocean-outline flex-1" onClick={() => clear()} disabled={items.length === 0}>
                Clear
              </Button>
              <Button className="btn-deep-ocean flex-1" onClick={handleCheckout} disabled={isPending || items.length === 0}>
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Dialog */}
      <InvoiceDialog
        open={showInvoice}
        onOpenChange={setShowInvoice}
        items={items}
        subtotal={subtotal()}
        discount={discount}
        total={finalTotal()}
        onConfirm={confirmAndCreateOrder}
        confirming={placing}
      />
    </div>
  );
}
