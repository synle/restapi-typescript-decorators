import { RestClient, RestApi, RequestBody, PathParam, QueryParams, ApiResponse } from '../index';

import { HttpBinGetResponse, HttpBinPostResponse } from './HttpBinTypes';

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class PublicApiDataStore {
  @RestApi('/post', {
    method: 'POST',
  })
  doSimpleHttpBinPost(@RequestBody _body): ApiResponse<HttpBinPostResponse> {}

  @RestApi('/get')
  doSimpleHttpBinGet(@QueryParams _queryParams): ApiResponse<HttpBinGetResponse> {}

  @RestApi('/anything/{messageId}')
  doSimpleHttpBinPathParamsGet(
    @PathParam('messageId') _targetMessageId: string,
    @QueryParams _queryParams,
  ): ApiResponse<HttpBinGetResponse> {}
}
