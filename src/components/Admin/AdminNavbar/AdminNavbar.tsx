"use client";

import { Icon } from "@iconify/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminNavbar = () => {
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
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Icon icon="solar:bell-linear" className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary-normal" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="View storefront"
          render={<a href="/" target="_blank" rel="noopener noreferrer" />}
        >
          <Icon icon="solar:shop-linear" className="h-5 w-5" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-none px-1.5 py-1 outline-none hover:bg-muted data-popup-open:bg-muted">
            <Avatar size="sm">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:grid">
              <span className="text-xs font-medium">Store Admin</span>
              <span className="text-[11px] text-muted-foreground">admin@hamiltonliquorstore.com</span>
            </div>
            <Icon icon="solar:alt-arrow-down-linear" className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon icon="solar:user-linear" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon icon="solar:settings-linear" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
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
