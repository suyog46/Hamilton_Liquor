import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/Admin/AdminSidebar/AdminSidebar";
import AdminNavbar from "@/components/Admin/AdminNavbar/AdminNavbar";
import AdminFooter from "@/components/Admin/AdminFooter/AdminFooter";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminNavbar />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
