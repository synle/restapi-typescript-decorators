// @ts-ignore
import { RestClient, RestApi, PathParam, ApiResponse } from 'restapi-typescript-decorators';

import { HttpBinResponse, HttpBinRequest } from './types';

@RestClient({
  baseUrl: 'https://httpbin.org/cookies/set/{cookieName}/{cookieValue}',
})
export class PathParamApiDataStore {
  @PathParam('cookieName')
  cookieName: string;

  constructor(newCookieName: string) {
    this.cookieName = newCookieName;
  }

  @RestApi()
  doGet(@PathParam('cookieValue') _newCookieValue: string): ApiResponse<HttpBinResponse> {}
}
