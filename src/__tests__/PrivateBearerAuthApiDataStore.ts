// @ts-ignore
import {
  RestClient,
  RestApi,
  CredentialProperty,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinAuthResponse } from './types';

@RestClient({
  baseUrl: 'https://httpbin.org',
  authType: 'Bearer',
})
export class PrivateBearerAuthApiDataStore {
  @CredentialProperty('AccessToken')
  accessToken: string;

  constructor(newAccessToken: string) {
    this.accessToken = newAccessToken;
  }

  @RestApi('/bearer', {
    method: 'GET',
  })
  doAuthenticatedCall(): ApiResponse<HttpBinAuthResponse> {}
}
