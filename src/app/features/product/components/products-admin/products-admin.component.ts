import { Component, LOCALE_ID, OnInit } from "@angular/core";
import { Product } from "../products/product.model";
import { CrudItemOptions } from "app/shared/utils/crud-item-options/crud-item-options.model";
import { ControlType } from "app/shared/utils/crud-item-options/control-type.model";
import { TableLazyLoadEvent } from "app/shared/ui/table/table-lazyload-event.model";
import { ProductService } from "../../../product.service";
import { SelectItem } from "primeng/api";
import { ListService } from "app/shared/ui/list/list.service";
import { delay, switchMap, tap } from "rxjs";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-products-admin",
  templateUrl: "./products-admin.component.html",
  styleUrls: ["./products-admin.component.scss"],
})
export class ProductsAdminComponent implements OnInit {
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
  public categoryOptions: SelectItem[] = [
    { label: "Accessories", value: "Accessories" },
    { label: "Fitness", value: "Fitness" },
    { label: "Clothing", value: "Clothing" },
    { label: "Electronics", value: "Electronics" },
  ];
  public inventoryStatusOptions: SelectItem[] = [
    { label: "In Stock", value: "INSTOCK" },
    { label: "Low Stock", value: "LOWSTOCK" },
    { label: "Out of Stock", value: "OUTOFSTOCK" },
  ];

  public cols: CrudItemOptions[] = [];

  constructor(
    private productService: ProductService,
    private currency: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.inititateColumns();
  }

  loadProducts(
    page: number = 1,
    size: number = 10,
    sort: string = "name,asc",
    filter = {}
  ) {
    this.productService
      .getProducts({ page, size, sort, ...filter })
      .pipe(
        tap(() => (this.loading = true)),
        delay(3000)
      )
      .subscribe({
        next: (data) => {
          this.products = data.results;
          this.totalRecords = data.total_results;
          this.loading = false;
        },
        error: () => {
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
        .pipe(switchMap(() => this.reloadItem()))
        .subscribe((products) => {
          this.products = products.results;
          this.totalRecords = products.total_results;
        });
    } else {
      console.log("onSave", product);
      this.productService
        .partialUpdateProduct(product.id, product)
        .pipe(switchMap(() => this.reloadItem()))
        .subscribe((products) => {
          this.products = products.results;
          this.totalRecords = products.total_results;
        });
    }
  }

  onDelete(ids: number[]): void {
    this.productService
      .deleteProducts(ids)
      .pipe(switchMap(() => this.reloadItem()))
      .subscribe((products) => {
        this.products = products.results;
        this.totalRecords = products.total_results;
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    // console.log("onLazyLoad", event);
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
      {
        key: "id",
        label: "Id",
        controlType: ControlType.INPUT,
        type: "text",
        columnOptions: { default: false, sortable: true, filterable: true },
        controlOptions: { disableOnCreate: true, hideOnCreate: true },
      },
      {
        key: "code",
        label: "Code",
        controlType: ControlType.INPUT,
        type: "text",
        columnOptions: { default: true, sortable: true, filterable: true },
      },
      {
        key: "name",
        label: "Name",
        controlType: ControlType.INPUT,
        type: "text",
        columnOptions: { default: true, sortable: true, filterable: true },
      },
      {
        key: "description",
        label: "Description",
        controlType: ControlType.INPUT,
        type: "text",
        columnOptions: { default: false, sortable: true, filterable: true },
      },
      {
        key: "price",
        label: "Price",
        controlType: ControlType.NUMBER,
        type: "number",
        columnOptions: {
          default: true,
          sortable: true,
          filterable: true,
          customCellRenderer: (cellValue: number) =>
            this.currency.transform(cellValue),
        },
      },
      {
        key: "category",
        label: "Category",
        controlType: ControlType.SELECT,
        options: this.categoryOptions,
        type: "text",
        columnOptions: { default: true, sortable: true, filterable: true },
      },
      {
        key: "quantity",
        label: "Quantity",
        controlType: ControlType.NUMBER,
        type: "number",
        columnOptions: { default: true, sortable: true, filterable: true },
      },
      {
        key: "inventoryStatus",
        label: "Inventory Status",
        controlType: ControlType.SELECT,
        options: this.inventoryStatusOptions,
        type: "text",
        columnOptions: {
          default: true,
          sortable: true,
          filterable: true,
        },
      },
      {
        key: "rating",
        label: "Rating",
        controlType: ControlType.NUMBER,
        type: "number",
        columnOptions: { default: true, sortable: true, filterable: true },
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
}
class ProductImpl implements Product {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}
