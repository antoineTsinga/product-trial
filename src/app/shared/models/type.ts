import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: "body";
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface PagingResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
  page_offset: number;
  size: number;
}

// page=1&sort_by=popularity,desc
export interface PaginationParams {
  page: number;
  [param: string]:
    | string
    | number
    | boolean
    | readonly (string | number | boolean)[];
  //   total_pages: number;
  //   total_results: number;
}
