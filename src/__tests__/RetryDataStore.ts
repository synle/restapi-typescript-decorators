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
      count: 5, // maximum retry 5 times
      delay: 1000, // retry after 1 second
    },
  })
  doApiWithRetry(): ApiResponse<HttpBinResponse> {}
}
