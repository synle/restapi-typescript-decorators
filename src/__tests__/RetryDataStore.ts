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
  @RestApi('/retry/no_extra_headers', {
    retryConfigs: {
      count: 5, // maximum retry 5 times
      delay: 1000, // retry after 1 second
    },
  })
  doApiWithFixedRetryAfter(): ApiResponse<HttpBinResponse> {}

  @RestApi('/retry/retry_after_as_seconds', {
    retryConfigs: {
      count: 5, // maximum retry 5 times
      delay: 1000, // retry after 1 second
    },
  })
  doApiWithRetryAfterAsSeconds(): ApiResponse<HttpBinResponse> {}
}
