"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white p-7 shadow-[0_8px_32px_rgba(0,0,0,0.18)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialog.Title className="font-display text-[1.35rem] font-bold leading-snug text-[#1a1720]">
            {title}
          </AlertDialog.Title>

          {description ? (
            <AlertDialog.Description className="mt-3 text-[0.95rem] leading-relaxed text-[#4d443d]">
              {description}
            </AlertDialog.Description>
          ) : null}

          <div className="mt-7 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#c8c8c8] bg-white px-6 text-[0.95rem] font-medium text-[#1a202c] transition hover:bg-[#f5f0eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:ring-offset-2"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={
                  destructive
                    ? "inline-flex h-11 items-center justify-center rounded-[12px] bg-[#ff2d2d] px-6 text-[0.95rem] font-medium text-white transition hover:bg-[#e52222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d2d]/35 focus-visible:ring-offset-2"
                    : "inline-flex h-11 items-center justify-center rounded-[12px] bg-[#ff8a24] px-6 text-[0.95rem] font-medium text-white transition hover:bg-[#e87918] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:ring-offset-2"
                }
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
