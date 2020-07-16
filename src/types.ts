// enums
export enum AuthTypeEnum {
  Basic = 'Basic',
  Bearer = 'Bearer',
  Digest = 'Digest', // TODO: support this
}
export type AuthType = AuthTypeEnum | 'Basic' | 'Bearer' | 'Digest' | undefined;

export enum HttpVerbEnum {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}
export type HttpVerb = HttpVerbEnum | 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

// types
export interface IApiResponse<T> {
  url: string;
  request_headers: object | null;
  request_body: any;
  response_headers: object | null;
  status: number;
  statusText: string;
  ok: boolean;
  result: Promise<T>; // this is a promise for response data
  abort(); // used to abort the api
}

export interface RestClientOptions extends RequestInit {
  baseUrl: string;
  authType?: AuthType;
  request_transform?(
    fetchOptions: Request,
    body: object,
    instance: any,
  ): Request | Promise<Request>;
  response_transform?(fetchOptions: Request, resp: Response, instance: any): Promise<any>;
}

export interface RestApiOptions extends RequestInit {
  headers?: Record<string, string>;
  method?: HttpVerb;
  request_transform?(fetchOptions: Request, body: any, instance: any): Request | Promise<Request>;
  response_transform?(fetchOptions: Request, resp: Response, instance: any): Promise<any>;
}
