"use client";

import { useEffect } from "react";

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

/** 4–6s, para completar, borrar y posponer. */
export function Snackbar({ message, actionLabel, onAction, onClose, duration = 5000 }: SnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="gp-snackbar" role="status">
      <span>{message}</span>
      {actionLabel && (
        <button
          type="button"
          className="gp-snackbar__action"
          onClick={() => {
            onAction?.();
            onClose();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
