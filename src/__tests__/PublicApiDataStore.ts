import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from '../index';

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

  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleFormDataHttpBinPost(
    @FormDataBody('unitPrice') unitPrice: number,
    @FormDataBody('quantity') qty: number,
  ): ApiResponse<HttpBinPostResponse> {}
}
