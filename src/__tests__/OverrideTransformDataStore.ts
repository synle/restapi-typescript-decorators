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

// for demonstration, this transformation is done on all methods of this class, and simply
// transform and return a list of keys of the response object in the final result
@RestClient({
  baseUrl: 'https://httpbin.org',
  responseTransform: (
    fetchOptions: Request,
    resp: Response,
    instance: OverrideTransformDataStore,
  ): Promise<any> => {
    // note this transformation works for the post, but not on the get
    // which is why we added the bottom transformation specific to the get
    return resp.json().then((respJson) => {
      return Object.keys(respJson.json);
    });
  },
})
export class OverrideTransformDataStore {
  @RestApi('/post', {
    method: 'POST',
  })
  doSimpleHttpBinPost(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  @RestApi('/get', {
    responseTransform: (
      fetchOptions: Request,
      resp: Response,
      instance: OverrideTransformDataStore,
    ): Promise<any> => {
      // the global transformation is not specific to the get method
      // this is here to demonstrate that we can override the transform at
      // the invidiual level.
      return resp.json().then((respJson) => {
        return Object.keys(respJson.args);
      });
    },
  })
  doSimpleHttpBinGet(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}
}
