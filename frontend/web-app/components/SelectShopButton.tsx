"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SelectShopButton({ shopId }: { shopId: string }) {
  const router = useRouter();

  const handleSelect = async () => {
    await fetch("/api/session/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId }),
    });
    router.push(`dashboard`);
  };

  return <Button
    className="w-full group/btn bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
    onClick={handleSelect}>Open Shop</Button>;
}
