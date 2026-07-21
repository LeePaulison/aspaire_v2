"use client";

import { useState } from "react";
import { Cross2Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { AlertDialog } from "radix-ui";
import { useConversationsStore } from "@/store/stores/conversationsStore";

export const ConversationSidebar = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const conversations = useConversationsStore((state) => state.conversations);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!conversations) return null;

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  function formatRelative(updatedAt, now) {
    const date = new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const diff = date.getTime() - now.getTime();
    const minutes = Math.round(diff / 60000);

    if (Math.abs(minutes) < 60) {
      return formatter.format(minutes, "minute");
    }

    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) {
      return formatter.format(hours, "hour");
    }

    const days = Math.round(hours / 24);
    return formatter.format(days, "day");
  }

  const now = new Date();

  const requestDeletion = (conversation) => {
    setPendingDeletion(conversation);
    setDeleteError("");
  };

  const handleDialogChange = (open) => {
    if (!open && !deleting) {
      setPendingDeletion(null);
      setDeleteError("");
    }
  };

  const confirmDeletion = async () => {
    if (!pendingDeletion || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await onDeleteConversation(pendingDeletion.id);
      setPendingDeletion(null);
    } catch {
      setDeleteError("The conversation could not be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Conversations
          </h2>
          <span className="text-xs tabular-nums text-foreground-muted">
            {conversations.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <PlusIcon className="size-4" />
          <span>New conversation</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <p className="px-3 py-8 text-center text-sm leading-6 text-foreground-muted">
            Your conversations will appear here.
          </p>
        )}
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId;
          return (
            <div
              key={conversation.id}
              className={`group relative rounded-lg border transition-colors ${
                isActive
                  ? "border-border bg-sidebar-active before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-r-full before:bg-primary before:content-['']"
                  : "border-transparent hover:bg-sidebar-hover"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full flex-col rounded-lg py-3 pr-10 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isActive ? "pl-4" : "pl-3"}`}
              >
                <span className="w-full truncate text-sm font-medium text-foreground">
                  {conversation.preview}
                </span>
                <span className="mt-1 text-xs text-foreground-muted">
                  {formatRelative(conversation.updatedAt, now)}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${conversation.preview || "conversation"}`}
                title="Delete conversation"
                onClick={() => requestDeletion(conversation)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-foreground-muted opacity-0 transition hover:bg-background hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>

      <AlertDialog.Root
        open={Boolean(pendingDeletion)}
        onOpenChange={handleDialogChange}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="DialogOverlay" />
          <AlertDialog.Content className="DeleteDialogContent">
            <div className="flex items-start justify-between gap-4">
              <div>
                <AlertDialog.Title className="text-lg font-semibold text-foreground">
                  Delete conversation?
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-sm leading-6 text-foreground-muted">
                  “{pendingDeletion?.preview || "Untitled conversation"}” will be
                  permanently deleted. This cannot be undone.
                </AlertDialog.Description>
              </div>
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  aria-label="Close deletion confirmation"
                  disabled={deleting}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-secondary hover:text-foreground disabled:opacity-50"
                >
                  <Cross2Icon />
                </button>
              </AlertDialog.Cancel>
            </div>

            {deleteError && (
              <p className="mt-4 text-sm text-red-500" role="alert">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  disabled={deleting}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeletion}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </aside>
  );
};
