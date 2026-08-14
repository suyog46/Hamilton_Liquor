"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";

const AdminNavbar = () => {
  const router = useRouter();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      toast.error("Something went wrong signing out.");
    } finally {
      router.push("/login");
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="relative w-full max-w-sm">
        <Icon
          icon="solar:magnifer-linear"
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search orders, products, customers..."
          className="h-9 pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span
          aria-label="Notifications (coming soon)"
          aria-disabled="true"
          title="Notifications coming soon"
          className="relative flex size-9 cursor-not-allowed items-center justify-center text-muted-foreground opacity-40"
        >
          <Icon icon="solar:bell-linear" className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary-normal" />
        </span>

        <span
          aria-label="Storefront shortcut (coming soon)"
          aria-disabled="true"
          title="Storefront shortcut coming soon"
          className="flex size-9 cursor-not-allowed items-center justify-center text-muted-foreground opacity-40"
        >
          <Icon icon="solar:shop-linear" className="h-5 w-5" />
        </span>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-2 px-1.5 py-1 text-muted-foreground outline-none">
            <Avatar size="sm">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:grid">
              <span className="text-xs font-medium transition-colors group-hover:text-foreground">Store Admin</span>
              <span className="text-[11px] transition-colors group-hover:text-foreground/80">
                admin@hamiltonliquorstore.com
              </span>
            </div>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className="hidden h-3.5 w-3.5 transition-colors group-hover:text-foreground sm:block"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-lg p-1.5">
            <DropdownMenuItem className="rounded-md" onClick={() => router.push("/")}>
              <Icon icon="solar:shop-linear" />
              Switch to user side
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="rounded-md"
            >
              <Icon icon="solar:logout-2-linear" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminNavbar;
