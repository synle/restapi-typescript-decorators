import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse,
} from '../index';

import { HttpBinAuthResponse } from './HttpBinTypes';

@RestClient({
  baseUrl: 'https://httpbin.org',
  authType: 'Bearer',
})
export class PrivateBearerAuthApiDataStore {
  @CredentialProperty('AccessToken')
  accessToken: string;

  constructor(newAccessToken: string = '') {
    this.accessToken = newAccessToken;
  }

  @RestApi('/bearer', {
    method: 'GET',
  })
  doApiCallWithBearerToken(): ApiResponse<HttpBinAuthResponse> {}
}
