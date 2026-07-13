"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  adminNavCatalog,
  adminNavMarketing,
  adminNavOverview,
  adminNavSales,
  adminNavSecondary,
  adminNavStore,
  type AdminNavItem,
} from "@/lib/utils";

const isLinkActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

const navGroups: { label: string; items: AdminNavItem[] }[] = [
  { label: "Overview", items: adminNavOverview },
  { label: "Catalog", items: adminNavCatalog },
  { label: "Sales", items: adminNavSales },
  { label: "Marketing", items: adminNavMarketing },
  { label: "Store Operations", items: adminNavStore },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" />}
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center bg-primary-normal font-title text-sm font-bold text-black">
                H
              </span>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Hamilton Liquor</span>
                <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isLinkActive(pathname, item.href)}
                      tooltip={item.name}
                      render={<Link href={item.href} />}
                    >
                      <Icon icon={item.icon} className="size-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {adminNavSecondary.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isLinkActive(pathname, item.href)}
                tooltip={item.name}
                render={<Link href={item.href} />}
              >
                <Icon icon={item.icon} className="size-4" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
