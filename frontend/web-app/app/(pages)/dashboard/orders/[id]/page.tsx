import { getOrder } from "@/app/actions/orderAction";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderInvoice } from "@/components/pos/OrderInvoice";
import ReprintButton from "@/components/pos/ReprintButton";

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order || order?.success === false) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order Details</h2>
  <ReprintButton id={order.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderInvoice order={order} />
        </CardContent>
      </Card>
    </div>
  );
}
