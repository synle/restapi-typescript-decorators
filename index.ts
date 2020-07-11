const qs = require("qs");
const fetchData = require("node-fetch");
const AbortController = require("abort-controller");

export interface ApiResponse {
  request_headers: object | null;
  request_body: any;
  response_headers: object | null;
  status: number | null;
  result: Promise<any>; // this is a promise for response data
  abort(); // used to abort the api
}

export const RestApi = (
  url: string,
  { headers = {}, method = "GET", ...otherFetchOptions } = {}
) => {
  return (target: any, name: any, descriptor: any) => {
    descriptor.value = body => {
      method = method.toUpperCase();
      const headersToUse = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers
      };

      // set the body accordingly
      let bodyToUse;
      switch (method) {
        case "GET":
          url += `?${qs.stringify(body)}`;
          break;

        default:
          if (headersToUse["Accept"] === "application/json") {
            bodyToUse = JSON.stringify(body);
          } else {
            bodyToUse = body || null;
          }
          break;
      }

      const controller = new AbortController();
      const fetchOptionToUse = {
        ...otherFetchOptions,
        method: method,
        signal: controller.signal,
        headers: headersToUse,
        body: bodyToUse
      };

      const finalResp = <ApiResponse>{
        request_body: bodyToUse,
        request_headers: fetchOptionToUse.headers,
        abort: () => {
          controller.abort();
        }, // used to abort the api
      };

      finalResp.result = fetchData(url, fetchOptionToUse).then(resp => {
        finalResp.status = resp.status;
        finalResp.response_headers = resp.headers;

        if (fetchOptionToUse["headers"]["Accept"] === "application/json")
          return resp.json();
        return resp.text();
      });

      return finalResp;
    };

    return descriptor;
  };
};
