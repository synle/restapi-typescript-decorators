import { RestClient, RestApi, RequestBody, PathParam, QueryParams, ApiResponse } from '../index';

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class HttpBinDataStore {
  @RestApi('/post', {
    method: 'POST',
  })
  doSimpleHttpBinPost(@RequestBody _body): any {}

  @RestApi('/get')
  doSimpleHttpBinGet(@QueryParams _queryParams): any {}

  @RestApi('/anything/{messageId}')
  doSimpleHttpBinPathParamsGet(
    @PathParam('messageId') _targetMessageId,
    @QueryParams _queryParams,
  ): any {}
}
