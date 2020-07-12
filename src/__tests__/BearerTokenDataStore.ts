import {
  RestClient,
  RestApi,
  Authorization,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse,
} from '../index';

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class BearerTokenDataStore {
  @Authorization('Bearer')
  accessToken: string = '';

  constructor(newAccessToken: string = '') {
    console.log(newAccessToken);
    this.accessToken = newAccessToken;
  }

  @RestApi('/bearer', {
    method: 'GET',
  })
  doApiCallWithBearerToken(): any {}
}
