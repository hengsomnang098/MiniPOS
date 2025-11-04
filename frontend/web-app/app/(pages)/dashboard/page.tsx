import { auth } from "@/app/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrdersByShop } from "@/app/actions/orderAction";
import type { OrderDto } from "@/types/order";
import OrderFilters from "@/components/orders/OrderFilters";

export default async function DashboardPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  const session = await auth();
  if (!session) return <p>Not authenticated</p>;
  if (session.expiresIn && Number(session.expiresIn) < Date.now()) redirect("/auth/login?expired=true");

  const shopId = (await cookies()).get("activeShopId")?.value;
  if (!shopId) redirect("/");

  const roles = (session.user?.roles ?? []) as string[];
  const isStaff = roles.includes("Staff");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const startParam = searchParams?.startDate;
  const endParam = searchParams?.endDate;

  const startDate = isStaff ? startOfToday : startParam ? new Date(startParam) : startOfToday;
  const endDate = isStaff ? endOfToday : endParam ? new Date(endParam) : endOfToday;

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const qs = `?page=1&pageSize=20&startDate=${encodeURIComponent(formatDate(startDate))}&endDate=${encodeURIComponent(formatDate(endDate))}`;
  const page = await getOrdersByShop(qs, shopId!);
  const orders: OrderDto[] = page.items ?? [];

  const stats = {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, o) => sum + (o.finalAmount ?? 0), 0),
    completedOrders: orders.filter((o) => (o.status || "").toLowerCase() === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left">
            Orders
          </h2>

          {/* Filters (hidden for staff) */}
          <div className="w-full sm:w-auto sm:min-w-[520px]">
            <OrderFilters
              isStaff={isStaff}
              initialStartDate={formatDate(startDate)}
              initialEndDate={formatDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1))}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalOrders}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-primary">${stats.totalSales.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.completedOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-center text-sm sm:text-base">
              No orders found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        Order #{order.id?.slice(0, 8)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}{" "}
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        ${(order.finalAmount ?? order.totalAmount).toFixed(2)}
                      </p>
                      <span className="inline-block px-3 py-1 mt-1 text-xs sm:text-sm font-semibold rounded-full bg-primary/10 text-primary capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}`} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground truncate pr-4">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
