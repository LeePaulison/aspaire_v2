"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { AlertDialog } from "radix-ui";

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  error,
  loading = false,
  confirmLabel = "Confirm",
  loadingLabel,
  cancelLabel = "Cancel",
  closeLabel = "Close confirmation",
  variant = "default",
  onConfirm,
}) {
  const confirmClassName =
    variant === "destructive"
      ? "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      : "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="DialogOverlay" />
        <AlertDialog.Content className="ConfirmationDialogContent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <AlertDialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </AlertDialog.Title>
              {description ? (
                <AlertDialog.Description className="mt-2 text-sm leading-6 text-foreground-muted">
                  {description}
                </AlertDialog.Description>
              ) : null}
            </div>
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                aria-label={closeLabel}
                disabled={loading}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-secondary hover:text-foreground disabled:opacity-50"
              >
                <Cross2Icon />
              </button>
            </AlertDialog.Cancel>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-secondary disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={confirmClassName}
            >
              {loading ? loadingLabel || confirmLabel : confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
