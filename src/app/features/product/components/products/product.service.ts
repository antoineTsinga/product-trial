import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, map, Observable } from "rxjs";
import { Product } from "./product.model";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private productsUrl = "assets/products.json";

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ data: Product[] }>(this.productsUrl)
      .pipe(map((data) => data.data));
  }
  getProductsPage(first: number, rows: number): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(this.productsUrl).pipe(
      map((data: any) => {
        const startIndex = first;
        const endIndex = first + rows;
        return data.data.slice(startIndex, endIndex);
      })
    );
  }
}
