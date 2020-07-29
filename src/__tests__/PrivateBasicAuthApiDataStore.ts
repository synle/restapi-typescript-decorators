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
  authType: 'Basic',
})
export class PrivateBasicAuthApiDataStore {
  @CredentialProperty('Username')
  username: string;

  @CredentialProperty('Password')
  password: string;

  constructor(newUsername: string, newPassword: string) {
    this.username = newUsername;
    this.password = newPassword;
  }

  @RestApi('/basic-auth/good_username/good_password', {
    method: 'GET',
  })
  doAuthenticatedCall(): ApiResponse<HttpBinAuthResponse> {}
}
