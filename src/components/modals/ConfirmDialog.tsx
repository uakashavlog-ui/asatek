import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest border border-surface-container shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {variant === 'danger' ? 'warning' : 'verified'}
            </span>
          </div>
          <div className="flex-1">
            <h2 id="confirm-dialog-title" className="text-headline-sm font-bold text-on-surface">
              {title}
            </h2>
            <p className="mt-1.5 text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface text-sm font-semibold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              variant === 'danger' ? 'bg-error hover:bg-primary' : 'bg-primary hover:bg-on-primary-fixed-variant'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
