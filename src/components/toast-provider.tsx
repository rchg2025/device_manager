"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 10000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          style: {
            background: '#10b981', // green-500
          },
        },
        error: {
          style: {
            background: '#ef4444', // red-500
          },
        },
      }}
    />
  );
}
