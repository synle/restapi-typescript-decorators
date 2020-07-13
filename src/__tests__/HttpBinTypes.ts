export interface HttpBinAuthResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
}

export interface HttpBinGetResponse {
  args?: object;
  headers?: object;
  origin?: string;
  url?: string;
  data?: object;
  json?: string;
  form?: object;
}

export interface HttpBinPostResponse extends HttpBinGetResponse {}
