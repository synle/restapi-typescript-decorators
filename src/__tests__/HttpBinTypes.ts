export interface HttpBinAuthResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
}

export interface HttpBinGetResponse {
  args?: object;
  headers?: any;
  origin?: string;
  url?: string;
  data?: object;
  json?: string;
  form?: object;
}

export interface HttpBinPostResponse extends HttpBinGetResponse {}
