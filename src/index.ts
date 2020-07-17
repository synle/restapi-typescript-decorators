import get from 'lodash.get';
import set from 'lodash.set';
import objectAssign from 'lodash.assign';
import qs from 'qs';
import nodeFetch from 'node-fetch';
import FormDataForNode from 'form-data';
import AbortController from 'abort-controller';
import {
  AuthTypeEnum,
  HttpVerbEnum,
  RestClientOptions,
  RestApiOptions,
  IApiResponse,
} from './types';

export type ApiResponse<T> = IApiResponse<T> | void;

// figure out which api to use
const FormData = globalThis['FormData'] || FormDataForNode;
const fetch = globalThis['fetch'] || nodeFetch;

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
      if (_isOfTypeJson(fetchOptionToUse.headers['Accept']) && !(body instanceof FormData)) {
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
    if (_isOfTypeJson(fetchOptionToUse['headers']['Content-Type'])) {
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
  return fetch(url, restFetchOptions);
};

const _getRequestBody = (instance : any, methodName: any, inputs: any) =>
  inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];

const _getPathParams = (instance : any, methodName: any) =>
  get(instance, ['__decorators', methodName, '@PathParam'], {});

const _getFormDataBody = (instance : any, methodName: any, inputs: any) => {
  const paramKeys = Object.keys(get(instance, ['__decorators', methodName, '@FormDataBody'], {}));

  if (paramKeys.length > 0) {
    const myFormData = new FormData();
    paramKeys.forEach((paramKey) => {
      myFormData.append(
        paramKey,
        inputs[get(instance, ['__decorators', methodName, '@FormDataBody', paramKey])],
      );
    });

    return myFormData;
  }

  return null;
};

const _getFileUploadBody = (instance : any, methodName: any, inputs: any) =>
  inputs[get(instance, ['__decorators', methodName, '@FileUploadBody'])];

const _getQueryParams = (instance : any, methodName: any, inputs: any) =>
  inputs[get(instance, ['__decorators', methodName, '@QueryParams'])] || {};

const _getCredential = (instance: any) => {
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

const _getBase64FromString = (str: string) => {
  try {
    // for node
    return Buffer.from(str).toString('base64');
  } catch (e) {
    // for browser
    return btoa(str);
  }
};

// decorators
export const PathParam = (paramKey: string) => (
  target: any,
  methodName: string | symbol,
  paramIdx: number,
) => {
  set(target, ['__decorators', methodName, '@PathParam', paramKey], paramIdx);
};

export const QueryParams = (target: any, methodName: string | symbol, paramIdx: number) => {
  set(target, ['__decorators', methodName, '@QueryParams'], paramIdx);
};

export const FormDataBody = (paramKey: string) => (
  target: any,
  methodName: string | symbol,
  paramIdx: number,
) => {
  set(target, ['__decorators', methodName, '@FormDataBody', paramKey], paramIdx);
};

export const RequestBody = (target: any, methodName: string | symbol, paramIdx: number) => {
  set(target, ['__decorators', methodName, '@RequestBody'], paramIdx);
};

export const FileUploadBody = (target: any, methodName: string | symbol, paramIdx: number) => {
  set(target, ['__decorators', methodName, '@FileUploadBody'], paramIdx);
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

  const f: any = function (...inputs: any[]) {
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

    descriptor.value = function (...inputs: any[]) {
      const instance = this;

      // these are 3 types of body to be sent to the backend
      // we will choose them in this order
      // 1. requestBody
      // 2. formDataBody
      // 3. fileUploadBody
      const requestBody = _getRequestBody(instance, methodName, inputs);
      const formDataBody = _getFormDataBody(instance, methodName, inputs);
      const fileUploadBody = _getFileUploadBody(instance, methodName, inputs);

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
      const bodyToUse = fileUploadBody || formDataBody || requestBody;

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
            bodyToUse,
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
