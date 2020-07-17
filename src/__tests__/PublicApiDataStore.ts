import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  FileUploadBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinResponse, HttpBinRequest } from './types';

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class PublicApiDataStore {
  // do simple get with query params
  @RestApi('/get')
  doSimpleHttpBinGet(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple get with path params
  @RestApi('/anything/{messageId}')
  doSimpleHttpBinPathParamsGet(
    @PathParam('messageId') _targetMessageId: string,
    @QueryParams _queryParams: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // do simple post with request body
  @RestApi('/post', {
    method: 'POST',
  })
  doSimpleHttpBinPost(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple post with formData
  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleFormDataHttpBinPost(
    @FormDataBody('unitPrice') _unitPrice: number,
    @FormDataBody('quantity') _qty: number,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file via input named `mySms`
  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleUploadFileHttpBinPost(
    @FormDataBody('mySms') _mySmsContent: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file as a single stream
  @RestApi('/post', {
    method: 'POST',
    headers: {
      Accept: 'multipart/form-data',
    },
  })
  doSimpleUploadFileWithStreamHttpBinPost(
    @FileUploadBody _fileToUpload: any,
  ): ApiResponse<HttpBinResponse> {}

  // the actual API will return in 10 seconds, but the client
  // will fail and timeout in 3 seconds
  @RestApi('/delay/10', {
    timeout: 3000,
  })
  doSimpleTimeoutAPI(): ApiResponse<HttpBinResponse> {}

  // this API will always return 405 error
  @RestApi('/status/405')
  doSimpleErroneousAPI(): ApiResponse<HttpBinResponse> {}
}
