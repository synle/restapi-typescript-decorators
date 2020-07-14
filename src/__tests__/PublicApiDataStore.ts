import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  FileUploadBody,
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
    @FormDataBody('unitPrice') _unitPrice: number,
    @FormDataBody('quantity') _qty: number,
  ): ApiResponse<HttpBinPostResponse> {}

  // this example uploads the file via input named `mySms`
  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleUploadFileHttpBinPost(
    @FormDataBody('mySms') _mySmsContent,
  ): ApiResponse<HttpBinPostResponse> {}

  // this example uploads the file as a single stream
  @RestApi('/post', {
    method: 'POST',
    headers:{
      'Accept': 'multipart/form-data',
    },
  },
  )
  doSimpleUploadFileWithStreamHttpBinPost(
    @FileUploadBody _fileToUpload,
  ): ApiResponse<HttpBinPostResponse> {}
}
