export interface HttpBinRequest {
  [propName: string]: any;
}
export interface HttpBinResponse {
  args?: {
    [propName: string]: any;
  };
  headers?: {
    [propName: string]: any;
  };
  origin?: string;
  url?: string;
  data?: {
    [propName: string]: any;
  };
  json?:
    | string
    | {
        [propName: string]: any;
      };
  form?: {
    [propName: string]: any;
  };
  brotli?: boolean;
  deflated?: boolean;
  gzipped?: boolean;
  [propName: string]: any;
}

export interface HttpBinAuthResponse extends HttpBinResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
  [propName: string]: any;
}
