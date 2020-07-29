// @ts-ignore
import { RestClient, RestApi, ApiResponse } from 'restapi-typescript-decorators';

import { HttpBinResponse, HttpBinRequest } from './types';

@RestClient({
  baseUrl: 'https://synle-mock-server.herokuapp.com',
})
export class RetryDataStore {
  @RestApi('/retry/no_extra_headers', {
    retryConfigs: {
      count: 10, // maximum retries
      delay: 2000, // retry after this many second
    },
  })
  doApiWithFixedRetryAfter(): ApiResponse<HttpBinResponse> {}

  @RestApi('/retry/retry_after_as_seconds', {
    retryConfigs: {
      count: 10, //  maximum retries
      delay: 1000, // retry after this many seconds, because the API will set the retry-after
    },
  })
  doApiWithRetryAfterAsSeconds(): ApiResponse<HttpBinResponse> {}
}
