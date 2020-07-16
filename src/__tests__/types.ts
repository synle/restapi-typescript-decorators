export interface HttpBinResponse {
  args?: object;
  headers?: object;
  origin?: string;
  url?: string;
  data?: object;
  json?: string | object;
  form?: object;
  [propName: string]: any;
}

export interface HttpBinAuthResponse extends HttpBinResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
}

export interface HttpBinResponse {
  args?: object;
  headers?: object;
  origin?: string;
  url?: string;
  data?: object;
  json?: string | object;
  form?: object;
  [propName: string]: any;
}
