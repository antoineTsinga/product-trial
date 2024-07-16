import { Component, OnDestroy, OnInit } from "@angular/core";
import { Product, ProductImpl } from "../../product.model";
import { CrudItemOptions } from "app/shared/utils/crud-item-options/crud-item-options.model";
import { ControlType } from "app/shared/utils/crud-item-options/control-type.model";
import { TableLazyLoadEvent } from "app/shared/ui/table/table-lazyload-event.model";
import { ProductService } from "../../../product.service";
import { delay, Observable, of, Subscription, switchMap, tap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { CurrencyPipe } from "@angular/common";
import { getColumnAdmin } from "./products-admin-columns";
import { ScreenWidthService } from "app/shared/utils/screen-width/screen-width.service";
import { ScreenWidth } from "app/shared/utils/crud-item-options/screen-width.model";
import { TypeInput } from "app/shared/utils/crud-item-options/type.model";
import { MessageService } from "primeng/api";
import { SnackbarService } from "app/shared/utils/snackbar/snackbar.service";

@Component({
  selector: "app-products-admin",
  templateUrl: "./products-admin.component.html",
  styleUrls: ["./products-admin.component.scss"],
})
export class ProductsAdminComponent implements OnInit, OnDestroy {
  public products: Product[] = [];
  public totalRecords: number = 0;
  public loading: boolean = false;
  public searchParams: {
    page: number;
    size: number;
    sort: string;
    filter: {
      [key: string]: any;
    };
  } = { page: 0, size: 10, sort: "name,asc", filter: {} };

  public cols: CrudItemOptions[] = [];
  screenWidth: ScreenWidth;
  private screenWidthSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private currency: CurrencyPipe,
    private screenWidthService: ScreenWidthService,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.screenWidthSubscription =
      this.screenWidthService.screenWidth.subscribe((width) => {
        this.screenWidth = width;
        this.inititateColumns();
      });
    this.loadProducts();
  }

  ngOnDestroy() {
    this.screenWidthSubscription.unsubscribe();
  }

  loadProducts(
    page: number = 1,
    size: number = 10,
    sort: string = "name,asc",
    filter = {}
  ) {
    this.loading = true;
    this.productService.getProducts({ page, size, sort, ...filter }).subscribe({
      next: (data) => {
        this.products = data.results;
        this.totalRecords = data.total_results;
        this.loading = false;
      },
      error: (error) => {
        this.snackbarService.displayError();
        this.loading = false;
      },
    });
  }

  getParams(event: TableLazyLoadEvent) {
    const searchParams = event;
    const page = searchParams.first / searchParams.rows + 1;
    const size = searchParams.rows;
    const direction = searchParams.sortOrder === 1 ? "asc" : "desc";
    const sort = searchParams.sortField
      ? searchParams.sortField + "," + direction
      : "name,asc";

    let filter: {
      [key: string]: any;
    } = {};

    for (const key in searchParams.filters) {
      const match = searchParams.filters[key].matchMode;
      const value = searchParams.filters[key].value;
      if (value) filter[`${key}_${match}`] = value;
    }

    return { page, size, sort, filter };
  }
  onSave(product: ProductImpl): void {
    if (!product.id) {
      this.productService
        .createProduct(product)
        .pipe(
          tap(() =>
            this.snackbarService.displaySuccess("Product has been created.")
          ),
          switchMap((product) => this.uploadBlobImage(product)),
          switchMap(() => this.reloadItem())
        )
        .subscribe({
          next: (products) => {
            this.products = products.results;
            this.totalRecords = products.total_results;
          },
          error: (error) => {
            this.snackbarService.displayError(error.error);
          },
        });
    } else {
      this.productService
        .partialUpdateProduct(product.id, product)
        .pipe(
          tap(() =>
            this.snackbarService.displaySuccess("Product has been updated.")
          ),
          switchMap((product) => this.uploadBlobImage(product)),
          switchMap(() => this.reloadItem())
        )
        .subscribe({
          next: (products) => {
            this.products = products.results;
            this.totalRecords = products.total_results;
          },
          error: (error) => {
            this.snackbarService.displayError(error.error);
          },
        });
    }
  }

  onDelete(ids: number[]): void {
    this.productService
      .deleteProducts(ids)
      .pipe(
        tap(() => {
          if (ids.length > 1) {
            this.snackbarService.displaySuccess(
              "Products have been succesfuly deleted"
            );
          } else {
            this.snackbarService.displaySuccess(
              "Product has been succesfuly deleted"
            );
          }
        }),
        delay(500),
        switchMap(() => this.reloadItem())
      )
      .subscribe({
        next: (products) => {
          this.products = products.results;
          this.totalRecords = products.total_results;
        },
        error: (error) => {
          this.snackbarService.displayError(error.error);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const { page, size, sort, filter } = this.getParams(event);
    this.searchParams = { page, size, sort, filter };
    this.loadProducts(page, size, sort, filter);
  }

  getClassEntity() {
    const t = new ProductImpl();
    return ProductImpl;
  }

  reloadItem() {
    const { page, size, sort, filter } = this.searchParams;
    return this.productService.getProducts({
      page,
      size,
      sort,
      ...filter,
    });
  }

  inititateColumns() {
    this.cols = [
      ...getColumnAdmin(this.screenWidth),
      {
        key: "price",
        label: "Price",
        controlType: ControlType.INPUT,
        type: TypeInput.NUMBER,
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
          sortable: true,
          filterable: true,
        },
      },
    ];
  }

  getSeverity(inventoryStatus: string) {
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

  uploadBlobImage(product: Product): Observable<Product> {
    if (product.image.includes("blob")) {
      return fromFetch(product.image, {
        selector: (response) => response.blob(),
      }).pipe(
        switchMap((blob) => {
          const file = new File([blob], product.id + "");
          return this.productService.uploadImage(product.id, file);
        })
      );
    }
    return of(product);
  }
}
