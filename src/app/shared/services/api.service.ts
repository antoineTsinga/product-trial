import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { Options } from "../models/type";
import { environment } from "environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseUrl: string = environment.apiUrl + "/api/v1";
  constructor(private httpClient: HttpClient) {}

  get<T>(url: string, options: Options): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + url, {
      ...options,
      params: { ...options.params },
      responseType: "json",
    }) as Observable<T>;
  }

  post<T>(
    url: string,
    options: Options,
    body: any | null = null
  ): Observable<T> {
    return this.httpClient.post<T>(this.baseUrl + url, body, {
      ...options,
      params: { ...options.params },
      responseType: "json",
    }) as Observable<T>;
  }

  delete<T>(url: string, options: Options): Observable<T> {
    return this.httpClient.delete<T>(this.baseUrl + url, {
      ...options,
      params: { ...options.params },
      responseType: "json",
    }) as Observable<T>;
  }

  patch<T>(
    url: string,
    options: Options,
    body: any | null = null
  ): Observable<T> {
    return this.httpClient.patch<T>(this.baseUrl + url, body, {
      ...options,
      params: { ...options.params },
      responseType: "json",
    }) as Observable<T>;
  }

  put<T>(
    url: string,
    options: Options,
    body: any | null = null
  ): Observable<T> {
    return this.httpClient.put<T>(this.baseUrl + url, body, {
      ...options,
      params: { ...options.params },
      responseType: "json",
    }) as Observable<T>;
  }
}
