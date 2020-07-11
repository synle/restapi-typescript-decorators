import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse
} from "../src/index";

@RestClient({
  baseUrl: "https://httpbin.org"
})
export class HttpBinDataStore {
  @RestApi("/post", {
    method: "POST"
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
