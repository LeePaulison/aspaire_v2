"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

import { UserMenu } from "./UserMenu";
import { SettingsDialog } from "../chat/SettingsDialog";

export const Header = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
        },
      },
    });
  }

  return (
    <section className="flex justify-between items-center p-4 border-b border-border">
      <h1 className="font-bold text-2xl">sAIgely</h1>
      <UserMenu
        user={session?.user}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => setSettingsOpen(open)}
      />
    </section>
  );
};
