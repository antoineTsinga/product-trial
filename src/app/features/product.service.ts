import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, map, Observable } from "rxjs";
import { Product } from "./product/product.model";
import { ApiService } from "app/shared/services/api.service";
import { PaginationParams, PagingResponse } from "app/shared/models/type";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private productsUrl = "assets/products.json";

  constructor(private apiService: ApiService) {}

  getProducts(
    params: PaginationParams = { page: 1 }
  ): Observable<PagingResponse<Product>> {
    return this.apiService.get("/products", { params: { ...params } });
  }
  createProduct(product: Product): Observable<Product> {
    return this.apiService.post("/products", {}, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete(`/products/${id}`, {});
  }

  deleteProducts(ids: number[]): Observable<void> {
    return this.apiService.delete(`/products/delete`, { params: { ids } });
  }

  partialUpdateProduct(
    id: number,
    product: Partial<Product>
  ): Observable<Product> {
    return this.apiService.patch(`/products/${id}`, {}, product);
  }
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.apiService.put(`/products/${id}`, {}, product);
  }

  uploadImage(productId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", productId.toString());

    return this.apiService.post("/products/upload-image", {}, formData);
  }
}
