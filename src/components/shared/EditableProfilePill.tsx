"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";

type EditableProfilePillProps = {
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (newValue: string) => void; // 👈 Simply reports changes back to the master form hook
};

export function EditableProfilePill({
  label,
  value,
  error,
  disabled = false,
  onChange,
}: EditableProfilePillProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localDraft, setLocalDraft] = useState(value);

  const handleOpenEdit = () => {
    if (disabled) return;
    setLocalDraft(value); // Sync current parent value
    setIsEditing(true);
  };

  const handleApplyChange = () => {
    onChange(localDraft.trim()); // Send draft to the master state hook
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-end gap-2 p-3 border border-border rounded-xl bg-slate-50/50">
        <div className="flex-1">
          <Input
            label={label}
            value={localDraft}
            error={error}
            onChange={(e) => setLocalDraft(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-1 h-11 items-center">
          <button
            type="button"
            onClick={handleApplyChange}
            className="px-3 h-9 bg-emerald-500 text-white font-medium text-xs rounded-lg hover:bg-emerald-600 transition"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 h-9 bg-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleOpenEdit}
      className="group flex flex-col gap-0.5 p-3 border border-border rounded-xl bg-white hover:border-brand/40 hover:bg-slate-50/30 cursor-pointer transition"
    >
      <span className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground/80">
        {label}
      </span>
      <div className="flex justify-between items-center min-h-[24px]">
        <span className="text-sm font-medium text-foreground truncate">
          {value || <span className="text-slate-400 italic font-normal text-xs">Not set (Click to add)</span>}
        </span>
        <span className="text-xs font-semibold text-brand opacity-0 group-hover:opacity-100 transition px-1">
          Edit
        </span>
      </div>
      {error && <p className="text-[11px] font-medium text-danger mt-1">{error}</p>}
    </div>
  );
}