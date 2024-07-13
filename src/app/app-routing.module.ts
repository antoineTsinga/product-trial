import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProductsAdminComponent } from "./features/product/components/products-admin/products-admin.component";
import { ProductsComponent } from "./features/product/components/products/products.component";

const routes: Routes = [
  { path: "products", component: ProductsComponent },
  { path: "admin/products", component: ProductsAdminComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
