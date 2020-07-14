const get = require('lodash.get');
const set = require('lodash.set');
const objectAssign = require('lodash.assign');
const qs = require('qs');
const nodeFetch = require('node-fetch');
const FormData = require('form-data');
const AbortController = require('abort-controller');

const _isOfTypeJson = (typeAsString: string) =>
  (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;

const _defaultRequestTransform = (
  fetchOptionToUse: Request,
  body: object,
  instance: any,
): Promise<Request> => {
  let bodyToUse;
  switch (fetchOptionToUse.method) {
    case HttpVerbEnum.GET:
      break;

    default:
      // POST, PUT, DELETE, etc...
      if (_isOfTypeJson(fetchOptionToUse.headers['Accept'])) {
        bodyToUse = JSON.stringify(body);
      } else {
        bodyToUse = body || null;
      }
      break;
  }

  return Promise.resolve(
    objectAssign(fetchOptionToUse, {
      body: bodyToUse,
    }),
  );
};

const _defaultResponseTransform = (
  fetchOptionToUse: Request,
  resp: Response,
  instance: any,
): Promise<any> => {
  return resp.text().then((respText) => {
    if (_isOfTypeJson(fetchOptionToUse['headers']['Accept'])) {
      try {
        return JSON.parse(respText);
      } catch (e) {
        return respText;
      }
    }
    return respText;
  });
};

const _fetchData = (fetchOptions): Promise<Response> => {
  const { url, ...restFetchOptions } = fetchOptions;
  return nodeFetch(url, restFetchOptions);
};

const _getRequestBody = (instance, methodName, inputs) =>
  inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];

const _getPathParams = (instance, methodName) =>
  get(instance, ['__decorators', methodName, '@PathParam'], {});

const _getFormData = (instance, methodName, inputs) => {
  const paramKeys = Object.keys(get(instance, ['__decorators', methodName, '@FormData'], {}));

  if (paramKeys) {

    const myFormData = new FormData();
    paramKeys.forEach((paramKey) => {
      myFormData.append(
        paramKey,
        inputs[set(instance, ['__decorators', methodName, '@FormData', paramKey])],
      );
    });

    return myFormData;
  }

  return null;
};

const _getQueryParams = (instance, methodName, inputs) =>
  inputs[get(instance, ['__decorators', methodName, '@QueryParams'])] || {};

const _getCredential = (instance) => {
  switch (instance.authType) {
    case AuthTypeEnum.Bearer:
      return instance[get(instance, ['__decorators', '@CredentialProperty', 'AccessToken'])];
    case AuthTypeEnum.Basic:
      const username = instance[get(instance, ['__decorators', '@CredentialProperty', 'Username'])];
      const password = instance[get(instance, ['__decorators', '@CredentialProperty', 'Password'])];

      if (username && password) {
        return _getBase64FromString(`${username}:${password}`);
      }
      return '';
  }
};

const _getBase64FromString = (str) => {
  try {
    // for node
    return Buffer.from(str).toString('base64');
  } catch (e) {
    // for browser
    return btoa(str);
  }
};

// enums
enum AuthTypeEnum {
  Basic = 'Basic',
  Bearer = 'Bearer',
  Digest = 'Digest', // TODO: support this
}
type AuthType = AuthTypeEnum | 'Basic' | 'Bearer' | 'Digest' | undefined;

enum HttpVerbEnum {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}
type HttpVerb = HttpVerbEnum | 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

// types
interface IApiResponse<T> {
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
export type ApiResponse<T> = IApiResponse<T> | void;

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

// decorators
export const PathParam = (paramKey) => (
  target: any,
  methodName: string | symbol,
  paramIdx: number,
) => {
  set(target, ['__decorators', methodName, '@PathParam', paramKey], paramIdx);
};

export const QueryParams = (target: any, methodName: string | symbol, paramIdx: number) => {
  set(target, ['__decorators', methodName, '@QueryParams'], paramIdx);
};

export const FormData = (paramKey) => (
  target: any,
  methodName: string | symbol,
  paramIdx: number,
) => {
  set(target, ['__decorators', methodName, '@FormData', paramKey], paramIdx);
};

export const RequestBody = (target: any, methodName: string | symbol, paramIdx: number) => {
  set(target, ['__decorators', methodName, '@RequestBody'], paramIdx);
};

export const CredentialProperty = (credentialType: 'AccessToken' | 'Username' | 'Password') => (
  target: any,
  propertyName: string | symbol,
) => {
  set(target, ['__decorators', '@CredentialProperty', credentialType], propertyName);
};

export const RestClient = (restOptions: RestClientOptions) => (target: any) => {
  const {
    baseUrl,
    authType,
    request_transform = _defaultRequestTransform,
    response_transform = _defaultResponseTransform,
    ...defaultConfigs
  } = restOptions;

  const original = target;

  const f: any = function(...inputs) {
    return new original(...inputs);
  };
  f.prototype = original.prototype;

  const defaultConfigsToUse = objectAssign(
    {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {},
    },
    defaultConfigs,
  );

  defaultConfigsToUse.headers = objectAssign(
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    defaultConfigsToUse.headers,
  );

  f.prototype.defaultConfigs = defaultConfigsToUse;
  f.prototype.baseUrl = baseUrl;
  f.prototype.authType = authType || '';
  f.prototype.default_request_transform = request_transform;
  f.prototype.default_response_transform = response_transform;

  return f;
};

export const RestApi = (url: string, restApiOptions: RestApiOptions = {}) => {
  return (target: any, methodName: string | symbol, descriptor: any) => {
    const {
      headers = {},
      method = HttpVerbEnum.GET,
      request_transform,
      response_transform,
      ...otherFetchOptions
    } = restApiOptions;

    descriptor.value = function(...inputs) {
      const instance = this;

      const requestBody = _getRequestBody(instance, methodName, inputs);
      const formData = _getFormData(instance, methodName, inputs);

      // construct the url wild cards {param1} {param2} etc...
      let urlToUse = '';
      const baseUrl = instance.baseUrl;
      urlToUse = `${baseUrl}${url}`;
      const pathParams = _getPathParams(instance, methodName);
      Object.keys(pathParams).forEach((paramKey) => {
        const paramIdx = pathParams[paramKey];
        const paramValue = inputs[paramIdx];
        urlToUse = urlToUse.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
      });

      // construct the query string if needed
      const queryParams = _getQueryParams(instance, methodName, inputs);
      if (Object.keys(queryParams).length > 0) {
        urlToUse += `?${qs.stringify(queryParams)}`;
      }

      // set up the headers
      const defaultConfigs = instance.defaultConfigs;
      const headersToUse = objectAssign({}, defaultConfigs.headers, headers);

      // add auth header if needed
      const authType = instance.authType;
      const credential = _getCredential(instance);
      if (authType && credential) {
        headersToUse['Authorization'] = `${authType} ${credential}`;
      }

      const controller = new AbortController();

      // doing the request transform
      const finalResp = <ApiResponse<any>>{
        abort: () => {
          controller.abort();
        }, // used to abort the api
      };

      // find out which transform to use (prioritize RestApi, then RestClient)
      const requestTransformToUse = request_transform || instance.default_request_transform;
      const responseTransformToUse = response_transform || instance.default_response_transform;

      if (finalResp) {
        finalResp.result = Promise.all([
          requestTransformToUse(
            objectAssign(
              {
                url: urlToUse,
                method: method.toUpperCase(),
                signal: controller.signal,
                headers: headersToUse,
              },
              otherFetchOptions,
            ),
            requestBody,
            instance,
          ),
        ]).then(([fetchOptionToUse]) => {
          finalResp.request_body = fetchOptionToUse.body;
          finalResp.request_headers = fetchOptionToUse.headers;

          return _fetchData(fetchOptionToUse).then((resp) => {
            finalResp.url = resp.url;
            finalResp.ok = resp.ok;
            finalResp.status = resp.status;
            finalResp.statusText = resp.statusText;
            finalResp.response_headers = resp.headers;

            // doing the response transform
            return responseTransformToUse(fetchOptionToUse, resp, instance);
          });
        });
      }

      return finalResp;
    };

    return descriptor;
  };
};
