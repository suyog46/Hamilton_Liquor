import Image from "next/image";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products } from "@/lib/utils/products";

const AdminProductsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Products"
        description="Add, edit, and manage inventory across your catalog."
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="gap-1.5">
              <Icon icon="solar:upload-linear" className="h-4 w-4" />
              Import CSV
            </Button>
            <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
              <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon="solar:magnifer-linear"
            className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search products…" className="h-9 pl-8" />
        </div>
        <Badge variant="outline">{products.length} products</Badge>
      </div>

      <div className="rounded-none ring-1 ring-foreground/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-none bg-muted">
                      <Image src={product.image} alt={product.name} fill sizes="36px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.volume}</TableCell>
                <TableCell>
                  ${product.price}
                  {product.originalPrice && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.inStock ? "secondary" : "destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="capitalize">
                        {tag.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit product">
                      <Icon icon="solar:pen-linear" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete product">
                      <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
