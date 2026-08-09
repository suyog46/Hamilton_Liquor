"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#16a34a",
          "--success-text": "#ffffff",
          "--success-border": "#16a34a",
          "--error-bg": "#dc2626",
          "--error-text": "#ffffff",
          "--error-border": "#dc2626",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
