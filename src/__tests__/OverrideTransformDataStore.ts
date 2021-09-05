import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
  AxiosError,
} from "axios";

import {
  RestClient,
  RestApi,
  RequestBody,
  QueryParams,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinResponse, HttpBinRequest } from './types';

// for demonstration, this transformation is done on all methods of this class, and simply
// transform and return a list of keys of the response object in the final result
@RestClient({
  baseUrl: 'https://httpbin.org',
  responseTransform: (
    fetchOptions: Request,
    resp: AxiosResponse<any>,
    instance: OverrideTransformDataStore,
  ): Promise<any> => {
    // note this transformation works for the post, but not on the get
    // which is why we added the bottom transformation specific to the get
      return Promise.resolve(Object.keys(JSON.parse(resp.data.json)));
  },
})
export class OverrideTransformDataStore {
  @RestApi('/post', {
    method: 'POST',
  })
  doPost(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  @RestApi('/get', {
    responseTransform: (
      fetchOptions: Request,
      resp: AxiosResponse<any>,
      instance: OverrideTransformDataStore,
    ): Promise<any> => {
      // the global transformation is not specific to the get method
      // this is here to demonstrate that we can override the transform at
      // the individual level.
      return Promise.resolve(Object.keys(resp.data.args));
    },
  })
  doGet(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}
}
