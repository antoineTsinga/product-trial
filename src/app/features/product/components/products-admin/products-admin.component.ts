import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Product, ProductImpl } from "../../product.model";
import { CrudItemOptions } from "app/shared/utils/crud-item-options/crud-item-options.model";
import { ControlType } from "app/shared/utils/crud-item-options/control-type.model";
import { TableLazyLoadEvent } from "app/shared/ui/table/table-lazyload-event.model";
import { ProductService } from "../../../product.service";
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  delay,
  map,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { CurrencyPipe } from "@angular/common";
import { getColumnAdmin } from "./products-admin-columns";
import { ScreenWidthService } from "app/shared/utils/screen-width/screen-width.service";
import { ScreenWidth } from "app/shared/utils/crud-item-options/screen-width.model";
import { TypeInput } from "app/shared/utils/crud-item-options/type.model";
import { SnackbarService } from "app/shared/utils/snackbar/snackbar.service";
import { PaginationParams } from "app/shared/models/type";

@Component({
  selector: "app-products-admin",
  templateUrl: "./products-admin.component.html",
  styleUrls: ["./products-admin.component.scss"],
})
export class ProductsAdminComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private currency = inject(CurrencyPipe);
  private screenWidthService = inject(ScreenWidthService);
  private snackbarService = inject(SnackbarService);

  private destroy$ = new Subject<void>();
  private searchParamsSubject = new BehaviorSubject<PaginationParams>({
    page: 1,
    size: 10,
    sort: "name,asc",
  });

  cols: CrudItemOptions[] = [];

  public products: Product[] = [];
  public totalRecords: number = 0;
  public loading: boolean = false;

  screenWidth: ScreenWidth;

  products$: Observable<Product[]>;
  totalRecords$: Observable<number>;

  ngOnInit(): void {
    this.initColumns();
    this.initProductsObservable();

    this.screenWidthService.screenWidth
      .pipe(takeUntil(this.destroy$))
      .subscribe((width) => {
        this.screenWidth = width;
        this.initColumns();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initColumns(): void {
    this.cols = [
      ...getColumnAdmin(this.screenWidth),
      {
        key: "price",
        label: "Price",
        controlType: ControlType.INPUT,
        type: TypeInput.NUMBER,
        numberType: "currency",
        min: 0,
        columnOptions: {
          default: [ScreenWidth.large, ScreenWidth.medium].includes(
            this.screenWidth
          ),
          sortable: true,
          filterable: true,
          customCellRenderer: (cellValue: number) =>
            this.currency.transform(cellValue),
        },
      },
      {
        key: "image",
        label: "Image",
        controlType: ControlType.IMAGE_UPLOAD,
        columnOptions: {
          default: [ScreenWidth.large].includes(this.screenWidth),
          sortable: false,
        },
      },
    ];
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

  onLazyLoad(event: TableLazyLoadEvent): void {
    const params = this.getParams(event);

    this.searchParamsSubject.next(params);
  }

  onSave(product: ProductImpl): void {
    const saveOperation$ = product.id
      ? this.productService.partialUpdateProduct(product.id, product)
      : this.productService.createProduct(product);

    saveOperation$
      .pipe(
        tap(() =>
          this.snackbarService.displaySuccess(
            `Product has been ${product.id ? "updated" : "created"}.`
          )
        ),
        switchMap((savedProduct) => this.uploadBlobImage(savedProduct)),
        switchMap(() => this.reloadItems()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {},
        error: (error) => this.snackbarService.displayError(error.error),
      });
  }

  onDelete(ids: number[]): void {
    this.productService
      .deleteProducts(ids)
      .pipe(
        tap(() =>
          this.snackbarService.displaySuccess(
            `Product${ids.length > 1 ? "s" : ""} ha${
              ids.length > 1 ? "ve" : "s"
            } been successfully deleted`
          )
        ),
        switchMap(() => this.reloadItems()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error) => this.snackbarService.displayError(error.error),
      });
  }

  private getParams(event: TableLazyLoadEvent): PaginationParams {
    const page = event.first / event.rows + 1;
    const size = event.rows;
    const direction = event.sortOrder === 1 ? "asc" : "desc";
    const sort = event.sortField
      ? `${event.sortField},${direction}`
      : "name,asc";

    const params: PaginationParams = { page, size, sort };

    if (event.filters) {
      Object.entries(event.filters).forEach(([key, value]) => {
        if (value.value) {
          params[`${key}_${value.matchMode}`] = value.value;
        }
      });
    }

    return params;
  }

  private reloadItems(): Observable<void> {
    return this.searchParamsSubject.pipe(
      take(1),
      tap((params) => this.searchParamsSubject.next(params)),
      map(() => undefined)
    );
  }

  private uploadBlobImage(product: Product): Observable<Product> {
    if (product.image?.includes("blob")) {
      return fromFetch(product.image, {
        selector: (response) => response.blob(),
      }).pipe(
        switchMap((blob) => {
          const file = new File([blob], `${product.id}`);
          return this.productService.uploadImage(product.id, file);
        })
      );
    }
    return of(product);
  }

  getSeverity(inventoryStatus: string): string {
    switch (inventoryStatus) {
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

  getClassEntity() {
    return ProductImpl;
  }
}
