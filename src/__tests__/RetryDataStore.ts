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
  baseUrl: 'https://synle-mock-server.herokuapp.com',
})
export class RetryDataStore {
  @RestApi('/retry/no_extra_headers', {
    retryConfigs: {
      count: 10, // maximum retries
      delay: 1000, // retry after 1 second
    },
  })
  doApiWithFixedRetryAfter(): ApiResponse<HttpBinResponse> {}

  @RestApi('/retry/retry_after_as_seconds', {
    retryConfigs: {
      count: 10, //  maximum retries
      delay: 1000, // this is ignored, because the API will set the retry-after
    },
  })
  doApiWithRetryAfterAsSeconds(): ApiResponse<HttpBinResponse> {}
}
