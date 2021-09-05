import { RestApiResponse } from 'rest-utils';


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

// used for xml parsing options
type X2jOptions = {
  attributeNamePrefix: string;
  attrNodeName: false | string;
  textNodeName: string;
  ignoreAttributes: boolean;
  ignoreNameSpace: boolean;
  allowBooleanAttributes: boolean;
  parseNodeValue: boolean;
  parseAttributeValue: boolean;
  arrayMode: boolean | 'strict';
  trimValues: boolean;
  cdataTagName: false | string;
  cdataPositionChar: string;
  parseTrueNumberOnly: boolean;
  tagValueProcessor: (tagValue: string, tagName: string) => string;
  attrValueProcessor: (attrValue: string, attrName: string) => string;
  stopNodes: string[];
};

// types
export interface ApiResponseResult {
  ok: boolean;
  status: number;
  statusText: string;
}
export interface IApiResponse<T> extends RestApiResponse<T> {
  result: Promise<ApiResponseResult>;
}

export interface RetryConfigs {
  count: number;
  delay?: number;
}

interface BaseRestOptions extends RequestInit {
  /**
   * map of request headers
   */
  headers?: Record<string, any>;
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
  requestTransform?(fetchOptions: Request, body: object, instance: any): Request | Promise<Request>;

  /**
   * response transformation - to be called before the response finally returned
   * can be useful if you want to do any last transformation on the client side
   * @param fetchOptions
   * @param resp
   * @param instance
   */
  responseTransform?(fetchOptions: Request, resp: Response, instance: any): Promise<any>;
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

  /**
   * XML parsing options to be provided for `fast-xml-parser` library
   */
  xmlParseOptions?: X2jOptions;
}

export interface RestApiOptions extends BaseRestOptions {
  /**
   * retry configs
   */
  retryConfigs?: RetryConfigs;
}
