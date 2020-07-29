// @ts-ignore
import {
  RestClient,
  RestApi,
  RequestProperty,
  RequestBody,
  PathParam,
  QueryParamProperty,
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
  /**
   * do get with absolute URL. This example will use
   * url defined here instead of appended it to the baseUrl
   */
  @RestApi('https://httpbin.org/get')
  doGetWithAbsoluteUrl(): ApiResponse<HttpBinResponse> {}

  /**
   * do get with query params (as a hash of queryParamKey => queryParamValue)
   * @param _queryParams
   */
  @RestApi('/get')
  doGetWithQueryParams(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  /**
   * do get with query params (as a single parameter). This example will construct url as
   * /get?keyword=<_keyword>&_pageSize=<number>
   * @param _keyword
   * @param _pageSize
   */
  @RestApi('/get')
  doGetWithSingleQueryParam(
    @QueryParamProperty('keyword') _keyword: string,
    @QueryParamProperty('pageSize') _pageSize: number,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do get with a combination of both single query param, and query params hash. In this
   * example, we will combine the two query params with single query param has higher
   * precedence than query params hash
   * @param _query
   * @param _pageSize
   */
  @RestApi('/get')
  doGetWithQueryParamsCombo(
    @QueryParams _query: HttpBinRequest,
    @QueryParamProperty('pageSize') _pageSize: number,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do get with a path param which will replace
   * `{recordId}` fragment in the URL with value you invoke the method with
   * @param _recordId value to replace {recordId} URL fragment
   */
  @RestApi('/anything/{recordId}')
  doGetWithPathParams(@PathParam('recordId') _recordId: string): ApiResponse<HttpBinResponse> {}

  /**
   * do get with path params and query params
   * @param _messageId value to replace {messageId} URL fragment
   * @param _queryParams query params
   */
  @RestApi('/anything/{messageId}')
  doGetWithPathParamsAndQueryParams(
    @PathParam('messageId') _messageId: string,
    @QueryParams _queryParams: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do get with a timeout. The REST call will be aborted after
   * 3 seconds.
   */
  @RestApi('/delay/10', {
    timeout: 3000,
  })
  doGetWithTimeout(): ApiResponse<HttpBinResponse> {}

  /**
   * do get with an Erroneous API. The backend of this API will
   * always return 405 error
   */
  @RestApi('/status/405')
  doErroneousAPI(): ApiResponse<HttpBinResponse> {}

  /**
   * do get with custom encoding from the backend API.
   * @param _encoding
   */
  @RestApi('/{encodingToUse}')
  doGetWithResponseEncoding(
    @PathParam('encodingToUse') _encoding: 'brotli' | 'gzip' | 'deflate',
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do get with XML Response. This method will parse the XML responses into
   * JSON objects
   */
  @RestApi('/xml', {
    headers: {
      Accept: 'application/xml',
    },
  })
  doGetWithXmlResponse(): ApiResponse<HttpBinResponse> {}

  /**
   * do get call with Plain Text Response. This method will simply return the
   * Plain Text response from the back end API.
   */
  @RestApi('/robots.txt', {
    headers: {
      Accept: 'text/plain',
    },
  })
  doGetWithPlainTextResponse(): ApiResponse<string> {}

  /**
   * do post JSON request body with  @RequestBody (as a hash)
   * @param _body
   */
  @RestApi('/post', {
    method: 'POST',
  })
  doPostWithJsonBodyHash(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  /**
   * do post JSON request body with  @RequestBody (as a hash)
   * @param _body
   */
  @RestApi('/post', {
    method: 'POST',
  })
  doPostWithSingleValuesJsonBody(
    @RequestProperty('firstName') _firstName: string,
    @RequestProperty('lastName') _lastName: string,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do post with a combination of both single request property, and request body hash. In this
   * example, we will combine the two together with single request property has higher
   * precedence than query params hash
   *
   * @param _body
   * @param _userId
   */
  @RestApi('/post', {
    method: 'POST',
  })
  doPostWithJsonBodyMixture(
    @RequestBody _body: HttpBinRequest,
    @RequestProperty('userId') _userId: string,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do post with URL encoded form request body
   * @param _body
   */
  @RestApi('/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  doPostWithEncodedFormData(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  /**
   * do post with formData
   * @param _unitPrice
   * @param _qty
   */
  @RestApi('/anything', {
    method: 'POST',
  })
  doPostWithFormBodyData(
    @FormDataBody('unitPrice') _unitPrice: number,
    @FormDataBody('quantity') _qty: number,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do post to upload the file via input named `mySms` with formData
   * @param _mySmsContent
   */
  @RestApi('/anything', {
    method: 'POST',
  })
  doUploadFileWithFormBodyData(
    @FormDataBody('mySms') _mySmsContent: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  /**
   * do post to upload the file as a single stream
   * @param _fileToUpload
   */
  @RestApi('/post', {
    method: 'POST',
  })
  doUploadFileWithStreamRequest(@FileUploadBody _fileToUpload: any): ApiResponse<HttpBinResponse> {}
}
