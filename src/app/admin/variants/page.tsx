import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import CreateVariant from "@/components/Admin/CreateVariant/CreateVariant";

const AdminVariantsPage = () => (
  <div className="flex flex-col gap-4">
    <AdminPageHeader title="Variants" description="Find a product, then add a sellable variant and its media." />
    <CreateVariant />
  </div>
);

export default AdminVariantsPage;
