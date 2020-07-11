import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse,
} from "./index";

@RestClient({
  baseUrl: "https://httpbin.org",
})
class HttpBinDataStore {
  @RestApi("/post", {
    method: "POST",
  })
  static doSimpleHttpBinPost(@RequestBody _body): any {}

  @RestApi("/get")
  static doSimpleHttpBinGet(@QueryParams _queryParams): any {}

  @RestApi("/anything/{messageId}")
  static doSimpleHttpBinPathParamsGet(
    @PathParam("messageId") _targetMessageId,
    @QueryParams _queryParams
  ): any {}
}

const doSimpleHttpBinPostResp = <ApiResponse>(
  HttpBinDataStore.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
);
doSimpleHttpBinPostResp.result.then((resp) =>
  console.log(
    "HttpBinDataStore.doSimpleHttpBinPost",
    doSimpleHttpBinPostResp.status,
    resp
  )
);


const doSimpleHttpBinGetResp = <ApiResponse>(
  HttpBinDataStore.doSimpleHttpBinGet( { a: 1, b: 2, c: 3 })
);
doSimpleHttpBinGetResp.result.then((resp) =>
  console.log(
    "HttpBinDataStore.doSimpleHttpBinGet",
    doSimpleHttpBinGetResp.status,
    resp
  )
);

const doSimpleHttpBinPathParamsGetResp = <ApiResponse>(
  HttpBinDataStore.doSimpleHttpBinPathParamsGet('secret_message_id_123', { aa: 1, bb: 2, cc: 3 })
);
doSimpleHttpBinPathParamsGetResp.result.then((resp) =>
  console.log(
    "HttpBinDataStore.doSimpleHttpBinPathParamsGet",
    doSimpleHttpBinPathParamsGetResp.status,
    resp
  )
);
