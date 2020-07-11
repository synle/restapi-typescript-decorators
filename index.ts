const fetchData = require("node-fetch");
const AbortController = require("abort-controller");

export interface ApiResponse {
  headers: object | null;
  status: number | null;
  result: Promise<any>; // this is a promise
  abort(); // used to abort the api
}

export const RestApi = (
  url: string,
  { headers = {}, method = "GET", ...otherFetchOptions } = {}
) => {
  return (target: any, name: any, descriptor: any) => {
    descriptor.value = body => {
      const controller = new AbortController();
      const fetchOptionToUse = {
        ...otherFetchOptions,
        method: method,
        signal: controller.signal,
        body: body || null,
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };

      const finalResp = <ApiResponse>{
        abort: controller.abort // used to abort the api
      };

      finalResp.result = fetchData(url, fetchOptionToUse).then(resp => {
        finalResp.status = resp.status;
        finalResp.headers = resp.headers;

        if (fetchOptionToUse["headers"]["Content-Type"] === "application/json")
          return resp.json();
        return resp.text();
      });

      return finalResp;
    };

    return descriptor;
  };
};
