import { Component, OnInit } from "@angular/core";
import { Product } from "../../product.model";
import { ProductService } from "../../../product.service";
import { tap } from "rxjs";
import { SelectItem } from "primeng/api";
import { DEFAULT_SEARCH_PARAMS } from "app/shared/ui/list/search.model";
import { ListService } from "app/shared/ui/list/list.service";
import { PaginationEvent } from "app/shared/ui/list/list.component";

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
  public listKey: string = "product-list";
  public sortField: string;
  public sortOrder: string;
  public searchParams = DEFAULT_SEARCH_PARAMS;
  public dateRangeKey: string = "creationTime";
  public loading: boolean = false;
  public mocks: Product[] = Array(6).fill(1);
  rowsPerPageOptions: number[] = [10, 25, 50];
  currentPage: number = 0;
  rows: number = 10;

  constructor(
    private productService: ProductService,
    private listService: ListService
  ) {}
  ngOnInit(): void {
    this.sortOptions = [
      { label: "Name Asc", value: "asc-name" },
      { label: "Name Desc", value: "desc-name" },
      { label: "Price Asc", value: "asc-price" },
      { label: "Price Desc", value: "desc-price" },
    ];

    this.loadProducts();
  }

  loadProducts(
    page: number = 1,
    size: number = 10,
    sort: string = "name,asc",
    filter = {}
  ) {
    this.productService
      .getProducts({ page, size, sort, ...filter })
      .pipe(tap(() => (this.loading = true)))
      .subscribe({
        next: (data) => {
          this.items = data.results;
          this.totalRecords = data.total_results;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onPageChange(event: PaginationEvent) {
    const { page, size, sort, filter } = this.getParams();
    this.loadProducts(page, size, sort, filter);
  }

  onFilteredChange(event: PaginationEvent) {
    const { page, size, sort, filter } = this.getParams();
    console.log(event);
    this.loadProducts(page, size, sort, filter);
  }

  getParams() {
    const searchParams = this.listService.getSearchConfig(this.listKey, "name");
    const page = searchParams.first / searchParams.rows + 1;
    const size = searchParams.rows;
    const sort = searchParams.sortField + "," + searchParams.sortOrder;

    let filter = {};
    if (searchParams.search) filter["name_startsWith"] = searchParams.search;

    return { page, size, sort, filter };
  }
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
