"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#151b2e",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#f1f5f9",
          borderRadius: "14px",
          fontSize: "0.875rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        },
      }}
      richColors
      closeButton
    />
  );
}
