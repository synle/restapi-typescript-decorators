import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from '../index';

import { HttpBinPostResponse } from './HttpBinTypes';

@RestClient({
  baseUrl: 'https://httpbin.org',
  headers: {
    'Accept-Encoding': 'ASCII',
    '--Rest-Client-Custom-Header': '<some_value_@Restclient_111>',
    '--Rest-Api-Custom-Header': '<this_value_will_overrided>',
  },
})
export class OverrideConfigApiDataStore {
  @RestApi('/anything', {
    method: 'POST',
    mode: 'no-cors',
    cache: 'reload',
    credentials: 'same-origin',
    headers: {
      'Accept-Encoding': 'UTF8',
      'Content-Type': '<some_value_@RestApi_333>',
      '--Rest-Api-Custom-Header': '<some_value_@RestApi_222>',
    },
  })
  doSimplePostWithCustomRestApiConfig(): ApiResponse<HttpBinPostResponse> {}

  @RestApi('/anything', {
    method: 'POST',
  })
  doSimplePostWithCustomRestClientConfig(): ApiResponse<HttpBinPostResponse> {}
}
