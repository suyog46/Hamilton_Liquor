import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  { label: "Revenue (30 days)", value: "$24,850", change: "+12.4%", icon: "solar:wallet-money-linear" },
  { label: "Orders (30 days)", value: "312", change: "+8.1%", icon: "solar:bag-check-linear" },
  { label: "Average Order Value", value: "$79.65", change: "+2.9%", icon: "solar:chart-2-linear" },
  { label: "New Customers", value: "58", change: "+5.0%", icon: "solar:user-plus-linear" },
];

const topProducts = [
  { name: "Ashford Reserve", category: "Whiskey", unitsSold: 64, revenue: 4352 },
  { name: "Golden Barrel", category: "Whiskey", unitsSold: 41, revenue: 3649 },
  { name: "Chateau Noir", category: "Wine", unitsSold: 58, revenue: 2436 },
  { name: "Amber Craft Lager", category: "Beer", unitsSold: 120, revenue: 2160 },
  { name: "Silver Peak", category: "Vodka", unitsSold: 52, revenue: 1820 },
];

const AdminReportsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Reports"
        description="Basic sales performance for the last 30 days."
        action={
          <Button type="button" variant="outline" className="gap-1.5">
            <Icon icon="solar:export-linear" className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-normal text-muted-foreground">{stat.label}</CardTitle>
              <Icon icon={stat.icon} className="h-4 w-4 text-primary-normal" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-semibold">{stat.value}</p>
                <span className="text-[11px] font-medium text-success">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead className="pr-4">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="pl-4 font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.unitsSold}</TableCell>
                  <TableCell className="pr-4">${product.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
