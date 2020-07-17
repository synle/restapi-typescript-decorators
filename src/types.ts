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
  /**
   * whether or not the API succeeds
   */
  ok: boolean;
  /**
   * this is a promise for response data
   */
  result: Promise<T>;
  /**
   * method which you can use to abort the API...
   */
  abort(): void;
}

interface BaseRestOptions extends RequestInit {
  /**
   * map of request headers
   */
  headers?: Record<string, string>;
  /**
   * request timeout in miliseconds
   */
  timeout?: number;
  /**
   * request transformation - to be called before the request is sent to the backend
   *
   * @param fetchOptions
   * @param body
   * @param instance
   */
  request_transform?(
    fetchOptions: Request,
    body: object,
    instance: any,
  ): Request | Promise<Request>;

  /**
   * response transformation - to be called before the response finally returned
   * can be useful if you want to do any last transformation on the client side
   * @param fetchOptions
   * @param resp
   * @param instance
   */
  response_transform?(fetchOptions: Request, resp: Response, instance: any): Promise<any>;
}

export interface RestClientOptions extends BaseRestOptions {
  /**
   * baseUrl to be used for the RestClient. This will be prepended to all the
   * URLs
   */
  baseUrl: string;

  /**
   * API Authorization mode
   */
  authType?: AuthType;
}

export interface RestApiOptions extends BaseRestOptions {}
