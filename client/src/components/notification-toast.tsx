import { useEffect, useState } from "react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function NotificationToast() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="notification-toast border-0 text-white">
            <div className="grid gap-1">
              {title && <ToastTitle className="flex items-center">
                <i className="fas fa-check-circle text-2xl mr-3" />
                {title}
              </ToastTitle>}
              {description && (
                <ToastDescription className="text-white/90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/70 hover:text-white" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
