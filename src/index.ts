import get from 'lodash.get';
import set from 'lodash.set';
import qs from 'qs';
import FetchForNode from 'node-fetch';
import FormDataForNode from 'form-data';
import AbortControllerForNode from 'abort-controller';
import parser from 'fast-xml-parser';
import he from 'he';

import {
  AuthTypeEnum,
  HttpVerbEnum,
  RestClientOptions,
  RestApiOptions,
  IApiResponse,
} from './types';

const DEFAULT_TIMEOUT = 60000;

export type ApiResponse<T> = IApiResponse<T> | void;

// figure out which api to use
const fetch = globalThis['fetch'] || FetchForNode;
const FormData = globalThis['FormData'] || FormDataForNode;
const AbortController = globalThis['AbortController'] || AbortControllerForNode;

const xmlParseOptions = {
  attributeNamePrefix: '@_',
  attrNodeName: 'attr', //default is 'false'
  textNodeName: '#text',
  ignoreAttributes: true,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, //"strict"
  attrValueProcessor: (val: any, _attrName: string) => he.decode(val, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: (val: any, _tagName: string) => he.decode(val), //default is a=>a
  stopNodes: ['parse-me-as-string'],
};

const _isOfTypeJson = (typeAsString: string | null) =>
  (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;

const _isOfTypeXml = (typeAsString: string | null) =>
  (typeAsString || '').toLowerCase().indexOf('application/xml') >= 0;

const _defaultRequestTransform = (
  fetchOptionToUse: any,
  body: object,
  instance: any,
): Promise<Request> => {
  let bodyToUse;
  switch (fetchOptionToUse.method) {
    case HttpVerbEnum.GET:
      break;

    default:
      // POST, PUT, DELETE, etc...
      const requestFormat = fetchOptionToUse.headers['Content-Type'];
      if (body instanceof FormData) {
        bodyToUse = body;
      } else if (_isOfTypeJson(requestFormat)) {
        bodyToUse = JSON.stringify(body);
      } else {
        bodyToUse = body || null;
      }
      break;
  }

  return Promise.resolve(
    Object.assign(fetchOptionToUse, {
      body: bodyToUse,
    }),
  );
};

const _defaultResponseTransform = (
  fetchOptionToUse: any,
  resp: Response,
  instance: any,
): Promise<any> => {
  return resp.text().then((respText) => {
    const responseFormat = fetchOptionToUse.headers['Accept'];
    if (_isOfTypeJson(responseFormat)) {
      // client wants json response
      try {
        return JSON.parse(respText);
      } catch (e) {
        return respText;
      }
    } else if (_isOfTypeXml(responseFormat)) {
      // client wants xml response
      return parser.parse(respText, xmlParseOptions);
    }
    return respText;
  });
};

const _fetchData = (fetchOptions: Request): Promise<Response> => {
  const { url, ...restFetchOptions } = fetchOptions;
  return fetch(url, restFetchOptions);
};

const _getRequestBody = (instance: any, methodName: string, inputs: any[]) =>
  inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];

const _getPathParams = (instance: any, methodName: string) =>
  get(instance, ['__decorators', methodName, '@PathParam'], {});

const _getFormDataBody = (instance: any, methodName: string, inputs: any[]) => {
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

const _getFileUploadBody = (instance: any, methodName: string, inputs: any[]) =>
  inputs[get(instance, ['__decorators', methodName, '@FileUploadBody'])];

const _getQueryParams = (instance: any, methodName: string, inputs: any[]) =>
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

const _getBase64FromString = (strVal: string) => {
  try {
    // for node
    return Buffer.from(strVal).toString('base64');
  } catch (e) {
    // for browser
    return btoa(strVal);
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
    timeout = DEFAULT_TIMEOUT,
    request_transform = _defaultRequestTransform,
    response_transform = _defaultResponseTransform,
    ...defaultConfigs
  } = restOptions;

  const original = target;

  const f: any = function(...inputs: any[]) {
    return new original(...inputs);
  };
  f.prototype = original.prototype;

  const defaultConfigsToUse = Object.assign(
    {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {},
    },
    defaultConfigs,
  );

  defaultConfigsToUse.headers = Object.assign(
    {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
    },
    defaultConfigsToUse.headers,
  );

  f.prototype.defaultConfigs = defaultConfigsToUse;
  f.prototype.baseUrl = baseUrl;
  f.prototype.authType = authType || '';
  f.prototype.timeout = timeout;
  f.prototype.default_request_transform = request_transform;
  f.prototype.default_response_transform = response_transform;

  return f;
};

export const RestApi = (url: string, restApiOptions: RestApiOptions = {}) => {
  return (target: any, methodName: string, descriptor: any) => {
    const {
      headers = {},
      method = HttpVerbEnum.GET,
      timeout,
      request_transform,
      response_transform,
      ...otherFetchOptions
    } = restApiOptions;

    descriptor.value = function(...inputs: any[]) {
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
      const headersToUse = Object.assign({}, defaultConfigs.headers, headers);

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
      const timeoutToUse = timeout || instance.timeout;

      if (finalResp) {
        // hook up a set timeout to abort the request if needed
        const timeoutAbortApi = setTimeout(finalResp.abort, timeoutToUse);

        const baseOptions = Object.assign(
          {
            url: urlToUse,
            method: method.toUpperCase(),
            signal: controller.signal,
            headers: headersToUse,
          },
          otherFetchOptions,
        );

        finalResp.result = Promise.all([
          // if file upload is present, then use it
          fileUploadBody
            ? Object.assign(baseOptions, { body: fileUploadBody })
            : requestTransformToUse(baseOptions, formDataBody || requestBody, instance),
        ]).then(([fetchOptionToUse]) => {
          finalResp.request_body = fetchOptionToUse.body;
          finalResp.request_headers = fetchOptionToUse.headers;
          finalResp.url = fetchOptionToUse.url;

          return _fetchData(fetchOptionToUse).then(
            (resp) => {
              // if fetch succeeds
              finalResp.ok = resp.ok;
              finalResp.status = resp.status;
              finalResp.statusText = resp.statusText;
              finalResp.response_headers = resp.headers;

              // if API succeeds, then cancel the timer
              clearTimeout(timeoutAbortApi);

              // doing the response transform
              return responseTransformToUse(fetchOptionToUse, resp, instance);
            },
            function(error) {
              // if fetch fails...
              finalResp.ok = false;
              // finalResp.status = resp.status;
              // finalResp.statusText = resp.statusText;
              // finalResp.response_headers = resp.headers;

              // if API succeeds, then cancel the timer
              clearTimeout(timeoutAbortApi);

              throw error;
            },
          );
        });
      }

      return finalResp;
    };

    return descriptor;
  };
};
