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
  doGetWithQueryParams(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple get with absolute URL
  // this example will use url defined here
  // instead of appended it to the baseUrl
  @RestApi('https://httpbin.org/get')
  doGetWithAbsoluteUrl(): ApiResponse<HttpBinResponse> {}

  // do simple get with path params
  @RestApi('/anything/{messageId}')
  doGetWithPathParamsAndQueryParams(
    @PathParam('messageId') _targetMessageId: string,
    @QueryParams _queryParams: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // the actual API will return in 10 seconds, but the client
  // will fail and timeout in 3 seconds
  @RestApi('/delay/10', {
    timeout: 3000,
  })
  doGetWithTimeout(): ApiResponse<HttpBinResponse> {}

  // this API will always return 405 error
  @RestApi('/status/405')
  doErroneousAPI(): ApiResponse<HttpBinResponse> {}

  @RestApi('/{encodingToUse}')
  doGetWithResponseEncoding(
    @PathParam('encodingToUse') _encoding: 'brotli' | 'gzip' | 'deflate',
  ): ApiResponse<HttpBinResponse> {}

  @RestApi('/xml', {
    headers: {
      Accept: 'application/xml',
    },
  })
  doGetWithXmlResponse(): ApiResponse<HttpBinResponse> {}

  @RestApi('/robots.txt', {
    headers: {
      Accept: 'text/plain',
    },
  })
  doGetWithPlainTextResponse(): ApiResponse<string> {}

  // do simple post with JSON request body
  @RestApi('/post', {
    method: 'POST',
  })
  doPostWithJsonBody(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple post with URL encoded form request body
  @RestApi('/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  doPostWithEncodedFormData(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple post with formData
  @RestApi('/anything', {
    method: 'POST',
  })
  doPostWithFormBodyData(
    @FormDataBody('unitPrice') _unitPrice: number,
    @FormDataBody('quantity') _qty: number,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file via input named `mySms`
  @RestApi('/anything', {
    method: 'POST',
  })
  doUploadFileWithFormBodyData(
    @FormDataBody('mySms') _mySmsContent: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file as a single stream
  @RestApi('/post', {
    method: 'POST',
  })
  doUploadFileWithStreamRequest(@FileUploadBody _fileToUpload: any): ApiResponse<HttpBinResponse> {}
}
