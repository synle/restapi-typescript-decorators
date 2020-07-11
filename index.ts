const get = require("lodash.get");
const set = require("lodash.set");
const qs = require("qs");
const nodeFetch = require("node-fetch");
const AbortController = require("abort-controller");

export interface ApiResponse {
  request_headers: object | null;
  request_body: any;
  response_headers: object | null;
  status: number | null;
  result: Promise<any>; // this is a promise for response data
  abort(); // used to abort the api
}

const _defaultRequestTransform = (fetchOptionToUse, body) => {
  let bodyToUse;
  switch (fetchOptionToUse.method) {
    case "GET":
      break;

    default:
      // POST, PUT, DELETE, etc...
      if (fetchOptionToUse.headers["Accept"] === "application/json") {
        bodyToUse = JSON.stringify(body);
      } else {
        bodyToUse = body || null;
      }
      break;
  }
  fetchOptionToUse.body = bodyToUse;
};

const _defaultResponseTransform = (fetchOptionToUse, resp) => {
  if (fetchOptionToUse["headers"]["Accept"] === "application/json")
    return resp.json();
  return resp.text();
};

export const PathParam = paramKey => (
  target: any,
  methodName: string | symbol,
  paramIdx: number
) => {
  set(target, ["__decorators", methodName, "@PathParam", paramKey], paramIdx);
};

export const QueryParams = (
  target: any,
  methodName: string | symbol,
  paramIdx: number
) => {
  set(target, ["__decorators", methodName, "@QueryParams"], paramIdx);
};

export const RequestBody = (
  target: any,
  methodName: string | symbol,
  paramIdx: number
) => {
  set(target, ["__decorators", methodName, "@RequestBody"], paramIdx);
};

const fetchData = fetchOptions => {
  const { url, ...restFetchOptions } = fetchOptions;
  return nodeFetch(url, restFetchOptions);
};

export const RestClient = ({ baseUrl, ...defaultConfigs }) => (
  constructor: Function
) => {
  constructor.prototype.baseUrl = baseUrl || "";

  const defaultConfigsToUse = {
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {},
    ...defaultConfigs
  };
  defaultConfigsToUse.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...defaultConfigsToUse.headers
  };
  constructor.prototype.defaultConfigs = defaultConfigsToUse;
};

export const RestApi = (
  url: string,
  {
    headers = {},
    method = "GET",
    request_transform = _defaultRequestTransform,
    response_transform = _defaultResponseTransform,
    ...otherFetchOptions
  } = {}
) => {
  return (target: any, methodName: string | symbol, descriptor: any) => {
    descriptor.value = (...inputs) => {
      method = method.toUpperCase();
      const requestBody =
        inputs[get(target, ["__decorators", methodName, "@RequestBody"])];

      // construct the url wild cards {param1} {param2} etc...
      url = `${target.prototype.baseUrl}${url}`;
      const pathParams = get(
        target,
        ["__decorators", methodName, "@PathParam"],
        {}
      );
      Object.keys(pathParams).forEach(paramKey => {
        const paramIdx = pathParams[paramKey];
        const paramValue = inputs[paramIdx];

        url = url.replace(new RegExp(`{${paramKey}}`, "g"), paramValue);
      });

      // construct the query string if needed
      const queryParams =
        inputs[get(target, ["__decorators", methodName, "@QueryParams"])];
      url += `?${qs.stringify(queryParams)}`;

      const headersToUse = {
        ...target.prototype.defaultConfigs.headers,
        ...headers
      };

      const controller = new AbortController();
      const fetchOptionToUse = {
        ...otherFetchOptions,
        url,
        method: method,
        signal: controller.signal,
        headers: headersToUse,
        body: null
      };

      // doing the request transform
      request_transform(fetchOptionToUse, requestBody);

      const finalResp = <ApiResponse>{
        request_body: fetchOptionToUse.body,
        request_headers: fetchOptionToUse.headers,
        abort: () => {
          controller.abort();
        } // used to abort the api
      };

      finalResp.result = fetchData(fetchOptionToUse).then(resp => {
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
