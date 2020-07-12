import { access } from 'fs';

const get = require('lodash.get');
const set = require('lodash.set');
const qs = require('qs');
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');

const _isOfTypeJson = (typeAsString) =>
  (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;

const _defaultRequestTransform = (fetchOptionToUse, body) => {
  let bodyToUse;
  switch (fetchOptionToUse.method) {
    case 'GET':
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

export interface ApiResponse {
  request_headers: object | null;
  request_body: any;
  response_headers: object | null;
  status: number | null;
  result: Promise<any>; // this is a promise for response data
  abort(); // used to abort the api
}

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

export const RestClient = ({ baseUrl, ...defaultConfigs }) => (target: any) => {
  const original = target;

  const f: any = function(...inputs) {
    const instance = new original(...inputs);
    return instance;
  };
  f.prototype = original.prototype;

  const defaultConfigsToUse = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {},
    ...defaultConfigs,
  };
  defaultConfigsToUse.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...defaultConfigsToUse.headers,
  };
  f.prototype.defaultConfigs = defaultConfigsToUse;
  f.prototype.baseUrl = baseUrl;

  return f;
};

export const Authorization = (authType: 'Basic' | 'Bearer' | 'Digest' = 'Bearer') => (
  target: any,
  propertyName: string,
) => {
  target.authType = authType;
  let _credentials;

  Object.defineProperty(target, 'Credential', {
    set: function(_newCredential) {
      _credentials = _newCredential;
    },
    get: function() {
      return _credentials;
    },
    enumerable: false,
    configurable: false,
  });
};

export const RestApi = (
  url: string,
  {
    headers = {},
    method = 'GET',
    request_transform = _defaultRequestTransform,
    response_transform = _defaultResponseTransform,
    ...otherFetchOptions
  } = {},
) => {
  return (target: any, methodName: string | symbol, descriptor: any) => {
    descriptor.value = (...inputs) => {
      method = method.toUpperCase();
      const requestBody = inputs[get(target, ['__decorators', methodName, '@RequestBody'])];

      // construct the url wild cards {param1} {param2} etc...
      const baseUrl = target.baseUrl;
      url = `${baseUrl}${url}`;
      const pathParams = get(target, ['__decorators', methodName, '@PathParam'], {});
      Object.keys(pathParams).forEach((paramKey) => {
        const paramIdx = pathParams[paramKey];
        const paramValue = inputs[paramIdx];

        url = url.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
      });

      // construct the query string if needed
      const queryParams = inputs[get(target, ['__decorators', methodName, '@QueryParams'])] || {};
      if (Object.keys(queryParams).length > 0) {
        url += `?${qs.stringify(queryParams)}`;
      }

      // set up the headers
      const defaultConfigs = target.defaultConfigs;
      const headersToUse = {
        ...defaultConfigs.headers,
        ...headers,
      };

      // add auth header if needed
      const authType = target.authType;
      const credential = target.Credential;
      if (authType && credential) {
        headersToUse['Authorization'] = `${authType} ${credential}`;
      }

      const controller = new AbortController();
      const fetchOptionToUse = {
        ...otherFetchOptions,
        url,
        method: method,
        signal: controller.signal,
        headers: headersToUse,
        body: null,
      };

      // doing the request transform
      request_transform(fetchOptionToUse, requestBody);

      const finalResp = <ApiResponse>{
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
