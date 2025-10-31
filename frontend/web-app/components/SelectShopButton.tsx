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

  return <Button onClick={handleSelect}>Open Shop</Button>;
}
