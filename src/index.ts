const get = require('lodash.get');
const set = require('lodash.set');
const objectAssign = require('lodash.assign');
const qs = require('qs');
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');

const _isOfTypeJson = (typeAsString) =>
  (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;

const _defaultRequestTransform = (fetchOptionToUse, body) => {
  let bodyToUse;
  switch (fetchOptionToUse.method) {
    case HttpVerb.GET:
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
  fetchOptionToUse.body = bodyToUse;
};

const _defaultResponseTransform = (fetchOptionToUse, resp) => {
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

const _fetchData = (fetchOptions) => {
  const { url, ...restFetchOptions } = fetchOptions;
  return nodeFetch(url, restFetchOptions);
};

const _getRequestBody = (instance, methodName, inputs) =>
  inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];

const _getPathParams = (instance, methodName) =>
  get(instance, ['__decorators', methodName, '@PathParam'], {});

const _getQueryParams = (instance, methodName, inputs) =>
  inputs[get(instance, ['__decorators', methodName, '@QueryParams'])] || {};

const _getCredential = (instance) => {
  switch (instance.authType) {
    case AuthType.Bearer:
      return instance[get(instance, ['__decorators', '@CredentialProperty', 'AccessToken'])];
    case AuthType.Basic:
      const username = instance[get(instance, ['__decorators', '@CredentialProperty', 'Username'])];
      const password = instance[get(instance, ['__decorators', '@CredentialProperty', 'Password'])];

      // TODO: throws error here if no username or password...

      return _getBase64FromString(`${username}:${password}`);
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
enum AuthType {
  Basic = 'Basic' ,
  Bearer = 'Bearer' ,
  Digest = 'Digest'  // TODO: support this
};

enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH'
}


// types
export interface ApiResponse {
  url: string;
  request_headers: object | null;
  request_body: any;
  response_headers: object | null;
  status: number | null;
  result: Promise<any>; // this is a promise for response data
  abort(); // used to abort the api
}

export interface RestClientOptions {
  baseUrl: string;
  authType?: AuthType | 'Basic' | 'Bearer' | 'Digest' | undefined;
  headers?: object;
  mode?: string;
  cache?: string;
  credentials?: string;
}

export interface RestApiOptions {
  headers?: object;
  method?: HttpVerb | 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  request_transform?(fetchOptions: object, body: object): any;
  response_transform?(fetchOptions: object, resp: string | object): any;
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
  const { baseUrl, authType, ...defaultConfigs } = restOptions;

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

  return f;
};

export const RestApi = (url: string, restApiOptions: RestApiOptions = {}) => {
  return (target: any, methodName: string | symbol, descriptor: any) => {
    const {
      headers = {},
      method = HttpVerb.GET,
      request_transform = _defaultRequestTransform,
      response_transform = _defaultResponseTransform,
      ...otherFetchOptions
    } = restApiOptions;

    descriptor.value = function(...inputs) {
      const instance = this;

      const requestBody = _getRequestBody(instance, methodName, inputs);

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
      const fetchOptionToUse = objectAssign(
        {
          url: urlToUse,
          method: method.toUpperCase(),
          signal: controller.signal,
          headers: headersToUse,
          body: null,
        },
        otherFetchOptions,
      );

      // doing the request transform
      request_transform(fetchOptionToUse, requestBody);

      const finalResp = <ApiResponse>{
        url: urlToUse,
        request_body: fetchOptionToUse.body,
        request_headers: fetchOptionToUse.headers,
        abort: () => {
          controller.abort();
        }, // used to abort the api
      };

      finalResp.result = _fetchData(fetchOptionToUse).then((resp) => {
        finalResp.status = resp.status;
        finalResp.response_headers = resp.headers;

        // doing the response transform
        return response_transform(fetchOptionToUse, resp);
      });

      return finalResp;
    };

    return descriptor;
  };
};
