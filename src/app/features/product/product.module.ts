import { NgModule } from "@angular/core";
import { ProductsAdminComponent } from "./components/products-admin/products-admin.component";
import { ProductsComponent } from "./components/products/products.component";
import { SharedModule } from "app/shared/shared.module";
import { TagModule } from "primeng/tag";
import { DataViewModule } from "primeng/dataview";
import { RatingModule } from "primeng/rating";
import { ButtonModule } from "primeng/button";
import { CurrencyPipe } from "@angular/common";

@NgModule({
  declarations: [ProductsAdminComponent, ProductsComponent],
  imports: [
    SharedModule,
    DataViewModule,
    TagModule,
    RatingModule,
    ButtonModule,
  ],
  providers: [CurrencyPipe],
})
export class ProductModule {}
