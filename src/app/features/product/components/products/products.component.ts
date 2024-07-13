import { Component, OnInit } from "@angular/core";
import { Product } from "./product.model";
import { ProductService } from "./product.service";
import { BehaviorSubject, tap } from "rxjs";
import { SelectItem } from "primeng/api";
import { DEFAULT_SEARCH_PARAMS } from "app/shared/ui/list/search.model";
import { ListService } from "app/shared/ui/list/list.service";
import { PaginationEvent } from "app/shared/ui/list/list.component";
import { SidenavService } from "app/base/sidenav/sidenav.service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: [
    "./products.component.scss",
    "./products.list-item.scss",
    "./products.grid-item.scss",
  ],
})
export class ProductsComponent implements OnInit {
  public items: Product[] = []; // Les données des produits
  public totalRecords: number = 0;
  public sortOptions: SelectItem[];
  public layout: "grid" | "list" = "grid";
  public enableAdd: boolean = true;
  public enableDateRange: boolean = true;
  public selectable: boolean = true;
  public backEndSearch: boolean = false;
  public sortKey: string = "name";
  public sortField: string;
  public sortOrder: string;
  public searchParams = DEFAULT_SEARCH_PARAMS;
  public dateRangeKey: string = "creationTime";
  rowsPerPageOptions: number[] = [10, 25, 50];
  currentPage: number = 0;
  rows: number = 10;

  constructor(
    private productService: ProductService,
    private listService: ListService,
    private readonly sidenavService: SidenavService
  ) {}
  ngOnInit(): void {
    this.sortOptions = [
      { label: "Name Asc", value: "asc-name" },
      { label: "Name Desc", value: "desc-name" },
      { label: "Price Asc", value: "asc-price" },
      { label: "Price Desc", value: "desc-price" },
    ];

    console.log(this.sidenavService.getPinned());
    this.loadProducts();
  }

  get getExpanded(): boolean {
    return this.sidenavService.getExpanded();
  }
  get getPinned(): boolean {
    return this.sidenavService.getPinned();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      console.log(data);
      this.items = data;
      this.totalRecords = data.length; // Définir le nombre total de produits ici (en supposant 100 produits dans l'exemple JSON)
    });
  }

  onPageChange(event: PaginationEvent) {}

  getSeverity(product: Product) {
    switch (product.inventoryStatus) {
      case "INSTOCK":
        return "success";

      case "LOWSTOCK":
        return "warning";

      case "OUTOFSTOCK":
        return "danger";

      default:
        return null;
    }
  }
}
