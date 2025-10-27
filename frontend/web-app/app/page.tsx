// app/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "./actions/authAction";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

}
