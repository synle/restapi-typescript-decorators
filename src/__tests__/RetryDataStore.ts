import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinResponse, HttpBinRequest } from './types';

@RestClient({
  baseUrl: 'http://localhost:8080',
})
export class RetryDataStore {
  @RestApi('/hello', {
    retryConfigs: {
      count: 5,
    },
  })
  doApiWithRetry(): ApiResponse<HttpBinResponse> {}
}
