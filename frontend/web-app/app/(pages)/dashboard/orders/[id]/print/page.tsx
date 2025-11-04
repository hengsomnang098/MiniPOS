import { getOrder } from "@/app/actions/orderAction";
import { notFound } from "next/navigation";
import { OrderInvoice } from "@/components/pos/OrderInvoice";
import AutoPrint from "@/components/pos/AutoPrint";

export default async function PrintOrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order || order?.success === false) return notFound();

  return (
    <div className="p-4 print:p-0">
      <AutoPrint />
      <OrderInvoice order={order} />
    </div>
  );
}
