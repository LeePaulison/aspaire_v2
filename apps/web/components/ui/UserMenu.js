import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";

import { GearIcon, ExitIcon, PersonIcon } from "@radix-ui/react-icons";

export function UserMenu({ user, onOpenSettings, onLogout }) {
  const initials = user?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sidebar-hover transition-colors"
          aria-label="User menu"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="UserMenuAvatar"
              referrerPolicy="no-referrer"
            />
          ) : initials ? (
            <span className="UserMenuFallback" aria-hidden="true">
              {initials}
            </span>
          ) : (
            <PersonIcon size={18} className="DropdownMenuItemIcon" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="DropdownMenuContent"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={onOpenSettings}
          >
            <GearIcon size={18} className="DropdownMenuItemIcon" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="DropdownMenuSeparator" />

          <DropdownMenu.Item className="DropdownMenuItem" onSelect={onLogout}>
            <ExitIcon size={18} className="DropdownMenuItemIcon" />
            Logout
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
