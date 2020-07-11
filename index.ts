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
      fetchOptionToUse.url += `?${qs.stringify(body)}`;
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
  target.__decorators = {};
  target.__decorators[methodName] = target.__decorators[methodName] || {};
  target.__decorators[methodName]["@PathParam"] =
    target.__decorators[methodName]["@PathParam"] || {};
  target.__decorators[methodName]["@PathParam"][paramIdx] = paramKey;
};

export const RequestBody = (
  target: any,
  methodName: string | symbol,
  paramIdx: number
) => {
  target.__decorators = {};
  target.__decorators[methodName] = target.__decorators[methodName] || {};
  target.__decorators[methodName]["@RequestBody"] = paramIdx;
};

const fetchData = fetchOptions => {
  const { url, ...restFetchOptions } = fetchOptions;
  return nodeFetch(url, restFetchOptions);
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
      const body = inputs[target.__decorators[methodName]["@RequestBody"]];

      // construct the url wild cards {param1} {param2} etc...
      Object.keys(target.__decorators[methodName]["@PathParam"]).forEach(
        paramIdx => {
          const paramKey =
            target.__decorators[methodName]["@PathParam"][paramIdx];
          const paramValue = inputs[paramIdx];

          url = url.replace(new RegExp(`{${paramKey}}`, "g"), paramValue);
        }
      );

      const headersToUse = {
        Accept: "application/json",
        "Content-Type": "application/json",
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
      request_transform(fetchOptionToUse, body);

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
