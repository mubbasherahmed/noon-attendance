"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1e2538",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "#f1f5f9",
          borderRadius: "12px",
          fontSize: "0.875rem",
        },
      }}
      richColors
      closeButton
    />
  );
}
