import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/getSession";

export default async function ProtectedLayout({ children }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return children;
}
