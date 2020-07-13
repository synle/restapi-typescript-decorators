import { RestClient, RestApi, RequestBody, PathParam, QueryParams } from '../index';

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TransformationApiDataStore {
  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleRequestTransformApi(@RequestBody requestBody: object): any {}

  @RestApi('/anything', {
    method: 'POST',
  })
  doSimpleResponseTransformApi(@RequestBody requestBody: object): any {}
}
