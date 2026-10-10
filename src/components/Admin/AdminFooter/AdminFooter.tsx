import { Icon } from "@iconify/react";
import { WHATSAPP_SUPPORT_URL } from "@/lib/utils";

const AdminFooter = () => {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
      <span>&copy; {new Date().getFullYear()} Hamilton Liquor Store. Admin Panel.</span>
      <a
        href={WHATSAPP_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground underline-offset-4 hover:underline"
      >
        <Icon icon="logos:whatsapp-icon" className="size-3.5" />
        <span>Need help? Contact on WhatsApp</span>
      </a>
    </footer>
  );
};

export default AdminFooter;
