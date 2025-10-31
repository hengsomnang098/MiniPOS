import { redirect } from "next/navigation";
import { getCurrentUser } from "./actions/authAction";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Settings, ArrowRight, Waves } from "lucide-react";
import SelectShopButton from "@/components/SelectShopButton"; // 👈 New component
import { getShopByUser } from "./actions/shopUserAction";


export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) redirect("/auth/login");
  
  if (user.expiresIn && new Date(user.expiresIn) <= new Date()) {
    redirect("/auth/login");
  }

  const shops = await getShopByUser(user.user.id)
  const isSuperAdmin = user.user.roles?.includes("Super Admin");

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Animated ocean wave overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent animate-pulse"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e920_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e920_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 text-cyan-300 text-sm font-medium shadow-lg shadow-cyan-500/5">
            <Waves className="w-4 h-4" />
            <span>Point of Sale System</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance leading-tight tracking-tight">
            <span className="text-white">Your Retail</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient">
              Command Center
            </span>
          </h1>

          <p className="text-lg md:text-xl text-cyan-100/70 max-w-2xl text-pretty leading-relaxed">
            Manage your shops, track sales, and grow your business from one powerful dashboard.
          </p>
        </div>

        {/* Shop Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Super Admin Dashboard Card */}
          {isSuperAdmin && (
            <Card className="group relative overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 via-blue-950/50 to-slate-950/50 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />

              <CardHeader className="relative pb-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                  <Settings className="w-7 h-7 text-cyan-300" />
                </div>
                <CardTitle className="text-xl text-white font-semibold">Admin Dashboard</CardTitle>
                <CardDescription className="text-cyan-100/60 leading-relaxed">
                  Manage system-wide settings and oversee all shops.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <Button
                  asChild
                  className="w-full group/btn bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
                  size="lg"
                >
                  <a href="/dashboard" className="flex items-center justify-center gap-2">
                    <span className="font-medium">Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Shop Cards */}
          {shops.length === 0 ? (
            <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4 border border-cyan-500/20 bg-gradient-to-br from-slate-950/50 to-blue-950/50 backdrop-blur-xl border-dashed">
              <CardHeader className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-10 h-10 text-cyan-300/70" />
                </div>
                <CardTitle className="text-2xl text-white">No Shops Found</CardTitle>
                <CardDescription className="text-base mt-2 text-cyan-100/60">
                  You don&apos;t have access to any shops yet. Contact your administrator to get started.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            shops? shops.map((shop: any) => (
              <Card
                key={shop.id}
                className="group relative overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-950/40 via-blue-950/40 to-cyan-950/40 backdrop-blur-xl hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent" />

                <CardHeader className="relative pb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 backdrop-blur-sm border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/10">
                    <Store className="w-6 h-6 text-cyan-300" />
                  </div>
                  <CardTitle className="text-xl text-white font-semibold">{shop.name}</CardTitle>
                  {shop.description && (
                    <CardDescription className="text-cyan-100/60 leading-relaxed line-clamp-2">
                      {shop.userId}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="relative">
                  {/* 👇 Replaces <a> link */}
                  <SelectShopButton shopId={shop.id} />
                </CardContent>
              </Card>
            ))
              : <>


                <Card
                  className="group relative overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-950/40 via-blue-950/40 to-cyan-950/40 backdrop-blur-xl hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent" />

                  <CardHeader className="relative pb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 backdrop-blur-sm border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/10 items-center">
                      <Store className="w-6 h-6 text-cyan-300 items-center" />
                    </div>
                    <CardTitle className="text-xl text-white font-semibold text-center">
                      No Shops Available
                    </CardTitle>
                  </CardHeader>
                </Card>
              </>
          )}
        </div>
      </div>
    </main>
  );
}
