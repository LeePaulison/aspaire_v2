"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog, ScrollArea } from "radix-ui";

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel = "Close dialog",
  size = "default",
}) {
  const contentClassName =
    size === "large" ? "AppDialogContent AppDialogContentLarge" : "AppDialogContent";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className={contentClassName}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-2 text-sm leading-6 text-foreground-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-secondary hover:text-foreground"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          {size === "large" ? (
            <ScrollArea.Root className="DialogScrollArea mt-5 h-[min(74svh,46rem)]">
              <ScrollArea.Viewport className="DialogViewport">
                {children}
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                className="DialogScrollbar"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="DialogScrollThumb" />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner className="DialogScrollCorner" />
            </ScrollArea.Root>
          ) : (
            <div className="mt-5">{children}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
