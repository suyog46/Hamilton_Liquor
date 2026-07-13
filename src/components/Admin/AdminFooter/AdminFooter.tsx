const AdminFooter = () => {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
      <span>&copy; {new Date().getFullYear()} Hamilton Liquor Store. Admin Panel v0.1 (Design Preview).</span>
      <span>Need help? Contact the site developer.</span>
    </footer>
  );
};

export default AdminFooter;
