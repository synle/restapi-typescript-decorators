import get from 'lodash.get';
import set from 'lodash.set';
import qs from 'qs';
import FetchForNode from 'node-fetch';
import FormDataForNode from 'form-data';
import AbortControllerForNode from 'abort-controller';
import parser from 'fast-xml-parser';

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

const DEFAULT_XML_PARSE_OPTIONS = {
  attrPrefix: '@_',
  textNodeName: '#text',
  ignoreNonTextNodeAttr: true,
  ignoreTextNodeAttr: true,
  ignoreNameSpace: true,
};
const _isOfTypeJson = (typeAsString: string | null) =>
  (typeAsString || '').toLowerCase().includes('application/json');

const _isOfTypeXml = (typeAsString: string | null) =>
  (typeAsString || '').toLowerCase().includes('application/xml');

const _isOfTypeUrlEncodedForm = (typeAsString: string | null) =>
  (typeAsString || '').toLowerCase().includes('application/x-www-form-urlencoded');

const _getHeadersAsJson = (headers: Headers) => {
  const responseHeaders = {};
  [...headers.keys()].forEach((headerKey) => {
    set(responseHeaders, headerKey, headers.get(headerKey));
  });

  return responseHeaders;
};

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
      } else if (_isOfTypeUrlEncodedForm(requestFormat)) {
        bodyToUse = qs.stringify(body);
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
      return parser.parse(respText, instance.xmlParseOptions);
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

const _getPathParams = (instance: any, methodName: string, inputs: any[]) => {
  const pathParamValues: Record<string, any> = {};

  // get the path params from the method inputs
  const paramKeysFromMethod = get(
    instance,
    ['__decorators', methodName, '@PathParam-ParamIdx'],
    {},
  );
  Object.keys(paramKeysFromMethod).forEach((paramKey) => {
    const paramValue = inputs[paramKeysFromMethod[paramKey]];
    pathParamValues[paramKey] = paramValue;
  });

  // get the path params from the class members
  const paramKeysFromClassMember = get(instance, ['__decorators', '@PathParam-ClassMember'], {});

  Object.keys(paramKeysFromClassMember).forEach((paramKey) => {
    const paramValue = instance[paramKeysFromClassMember[paramKey]];
    pathParamValues[paramKey] = paramValue;
  });

  return pathParamValues;
};

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
export const PathParam = (paramKey: string) => {
  return function(...inputs: any[]) {
    const [target, methodName, paramIdx] = inputs;
    if (paramIdx >= 0) {
      // this decorator is used in a context of a method parameter
      set(target, ['__decorators', methodName, '@PathParam-ParamIdx', paramKey], paramIdx);
    } else {
      // this decorator is used in a context of a class property
      set(target, ['__decorators', '@PathParam-ClassMember', paramKey], methodName);
    }
  };
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
    xmlParseOptions = DEFAULT_XML_PARSE_OPTIONS,
    requestTransform = _defaultRequestTransform,
    responseTransform = _defaultResponseTransform,
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
      redirect: 'follow',
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
  f.prototype.defaultRequestTransform = requestTransform;
  f.prototype.defaultResponseTransform = responseTransform;
  f.prototype.xmlParseOptions = xmlParseOptions;

  return f;
};

export const RestApi = (url: string = '', restApiOptions: RestApiOptions = {}) => {
  return (target: any, methodName: string, descriptor: any) => {
    const {
      headers = {},
      method = HttpVerbEnum.GET,
      timeout,
      retryConfigs,
      requestTransform,
      responseTransform,
      ...otherFetchOptions
    } = restApiOptions;

    const _doApiCall = (instance: any, ...inputs: any[]): IApiResponse<any> => {
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

      if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
        // if the current url is absolute, then use it
        urlToUse = url;
      } else {
        // if not then appended current url to baseUrl
        const baseUrl = instance.baseUrl;
        urlToUse = `${baseUrl}${url}`;
      }

      // replace the url fragments from @PathParams
      const pathParams = _getPathParams(instance, methodName, inputs);
      Object.keys(pathParams).forEach((paramKey) => {
        const paramValue = pathParams[paramKey];
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
      const baseOptions = Object.assign(
        {
          url: urlToUse,
          method: method.toUpperCase(),
          signal: controller.signal,
          headers: headersToUse,
        },
        otherFetchOptions,
      );

      // figure out the request transformation to use
      let promisePreProcessRequest: any;
      if (fileUploadBody) {
        promisePreProcessRequest = Object.assign(baseOptions, { body: fileUploadBody });
      } else if (formDataBody) {
        promisePreProcessRequest = (requestTransform || instance.defaultRequestTransform)(
          baseOptions,
          formDataBody,
          instance,
        );
      } else {
        promisePreProcessRequest = (requestTransform || instance.defaultRequestTransform)(
          baseOptions,
          requestBody,
          instance,
        );
      }

      let retryTotal = 1,
        retryDelay = 3000;
      let hasRetriedCount = 0; // how many time has we done retries so far
      if (retryConfigs) {
        retryTotal = retryConfigs.count; // how many time to retry
        retryDelay = retryConfigs.delay || 3000; // retry after 3 seconds
      }

      const finalResp = <IApiResponse<any>>{
        url: baseOptions.url,
        responseHeaders: {},
        abort: () => {
          // when the API is aborted manually by the user
          controller.abort();
          hasRetriedCount = retryTotal; // do this to stop further API retries attempt
        }, // used to abort the api
      };
      const timeoutAbortApi = setTimeout(finalResp.abort, timeout || instance.timeout);

      finalResp.result = new Promise((resolve, reject) => {
        const _doFetchApi = () =>
          Promise.all([Promise.resolve(<Promise<any>>promisePreProcessRequest)]).then(
            ([fetchOptionToUse]) => {
              finalResp.requestBody = fetchOptionToUse.body;
              finalResp.requestHeaders = fetchOptionToUse.headers;
              finalResp.url = fetchOptionToUse.url;

              return _fetchData(fetchOptionToUse)
                .then(
                  (resp: Response) => {
                    // if fetch succeeds
                    finalResp.ok = resp.ok;
                    finalResp.status = resp.status;
                    finalResp.statusText = resp.statusText;

                    // transform the response header
                    finalResp.responseHeaders = _getHeadersAsJson(resp.headers);

                    // if API succeeds, then cancel the timer
                    clearTimeout(timeoutAbortApi);

                    // doing the response transform
                    return (responseTransform || instance.defaultResponseTransform)(
                      fetchOptionToUse,
                      resp,
                      instance,
                    );
                  },
                  function(error) {
                    // if fetch fails...
                    finalResp.ok = false;
                    // finalResp.status = resp.status;
                    // finalResp.statusText = resp.statusText;

                    // if API fails, then cancel the timer
                    clearTimeout(timeoutAbortApi);

                    return { error };
                  },
                )
                .then((resp) => {
                  hasRetriedCount++;

                  finalResp.retryCount = hasRetriedCount;

                  if (finalResp.ok) {
                    resolve(resp);
                  } else {
                    if (hasRetriedCount < retryTotal) {
                      // by default check if we have a valid `retry-after` response header, if yes, then use it
                      // if not then fall back to provided retryDelay in the config
                      let retryDelayToUse = retryDelay;
                      if (finalResp.responseHeaders) {
                        retryDelayToUse =
                          parseInt(finalResp.responseHeaders['retry-after']) * 1000 ||
                          retryDelayToUse;
                      }
                      setTimeout(_doFetchApi, retryDelayToUse);
                    } else {
                      // no more retry, reject the promise
                      reject(resp);
                    }
                  }
                });
            },
          );

        _doFetchApi(); // invoke the first call
      });

      return finalResp;
    };

    descriptor.value = function(...inputs: any[]) {
      const instance = this;
      return _doApiCall(instance, ...inputs);
    };

    return descriptor;
  };
};
