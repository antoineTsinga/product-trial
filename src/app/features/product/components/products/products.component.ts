import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Product } from "../../product.model";
import { ProductService } from "../../../product.service";
import { SelectItem } from "primeng/api";
import { DEFAULT_SEARCH_PARAMS } from "app/shared/ui/list/search.model";
import { ListService } from "app/shared/ui/list/list.service";
import { PaginationEvent } from "app/shared/ui/list/list.component";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";

import { SnackbarService } from "app/shared/utils/snackbar/snackbar.service";
import { PaginationParams } from "app/shared/models/type";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: [
    "./products.component.scss",
    "./products.list-item.scss",
    "./products.grid-item.scss",
  ],
})
export class ProductsComponent implements OnInit, OnDestroy {
  public products: Product[] = [];
  public totalRecords: number = 0;
  public sortOptions: SelectItem[];
  public layout: "grid" | "list" = "grid";
  public sortKey: string = "name";
  public listKey: string = "product-list";
  public loading: boolean = false;
  public mocks: Product[] = Array(6).fill(1);

  private snackbarService = inject(SnackbarService);
  private destroy$ = new Subject<void>();
  private searchParamsSubject = new BehaviorSubject<PaginationParams>({
    page: 1,
    size: 10,
    sort: "name,asc",
  });

  products$: Observable<Product[]>;
  totalRecords$: Observable<number>;

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

    this.initProductsObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private initProductsObservable(): void {
    const products$ = this.searchParamsSubject.pipe(
      tap(() => (this.loading = true)),
      switchMap((params) => this.productService.getProducts(params)),
      tap(() => (this.loading = false)),
      catchError((error) => {
        this.snackbarService.displayError();
        this.loading = false;
        return of({ results: [], total_results: 0 });
      })
    );

    this.products$ = products$.pipe(map((data) => data.results));
    this.totalRecords$ = products$.pipe(map((data) => data.total_results));

    combineLatest([this.products$, this.totalRecords$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([products, totalRecords]) => {
        this.products = products;
        this.totalRecords = totalRecords;
      });
  }

  onPageChange(event: PaginationEvent) {
    const params = this.getParams();

    this.searchParamsSubject.next(params);
  }

  onFilteredChange(event: PaginationEvent) {
    const params = this.getParams();

    this.searchParamsSubject.next(params);
  }

  getParams(): PaginationParams {
    const searchParams = this.listService.getSearchConfig(this.listKey, "name");
    const page = searchParams.first / searchParams.rows + 1;
    const size = searchParams.rows;
    const sort = searchParams.sortField + "," + searchParams.sortOrder;

    const params: PaginationParams = { page, size, sort };

    if (searchParams.search) params["name_contains"] = searchParams.search;

    return params;
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
