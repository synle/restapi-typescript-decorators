import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinResponse } from './types';

interface NumberPair {
  a: number;
  b: number;
}

interface FourNumberCollection {
  a: number;
  b: number;
  c: number;
  d: number;
}

interface CollectionSum {
  sum: number;
}

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TransformationApiDataStore {
  // this example will transform the request to make a and b and multiply
  // them by 100 and 200 respectively before sending them to the back end
  @RestApi('/anything', {
    method: 'POST',
    requestTransform: (
      fetchOptions: Request,
      pair: NumberPair,
      instance: TransformationApiDataStore,
    ): Request => {
      const newBody = {
        a: pair.a * 100,
        b: pair.b * 200,
      };

      return Object.assign(fetchOptions, {
        body: JSON.stringify(newBody),
      });
    },
  })
  doRequestTransformApi(@RequestBody _requestBody: NumberPair): ApiResponse<HttpBinResponse> {}

  // this example will make the api response to the backend
  // then transform the returned data by adding the 2 numbers a and b
  // and return the result as a sum
  @RestApi('/anything', {
    method: 'POST',
    responseTransform: (
      fetchOptions: Request,
      resp: Response,
      instance: TransformationApiDataStore,
    ): Promise<any> => {
      return resp.json().then((respJson) => {
        const pair = <NumberPair>JSON.parse(respJson.data);
        const sum = pair.a + pair.b;

        return { sum };
      });
    },
  })
  doResponseTransformApi(@RequestBody _requestBody: NumberPair): ApiResponse<CollectionSum> {}

  // this example will attempt making 2 async calls for 2 sums and then add them up
  // in the request body before sending them out to the backend
  @RestApi('/anything', {
    method: 'POST',
    requestTransform: (
      fetchOptions: Request,
      fourNumbers: FourNumberCollection,
      instance: TransformationApiDataStore,
    ): Promise<Request> => {
      if (instance) {
        const { a, b, c, d } = fourNumbers;

        const apiResponseSum1 = instance.doResponseTransformApi({ a: a, b: b });
        const apiResponseSum2 = instance.doResponseTransformApi({ a: c, b: d });

        if (!apiResponseSum1 || !apiResponseSum2) {
          throw 'One of the request for sum failed';
        }

        return Promise.all([apiResponseSum1.result, apiResponseSum2.result]).then(
          ([res1, res2]) => {
            const sum1 = res1.sum;
            const sum2 = res2.sum;
            const sum = sum1 + sum2;
            const newBody = { sum };

            return Promise.resolve(
              Object.assign(fetchOptions, {
                body: JSON.stringify(newBody),
              }),
            );
          },
        );
      }
      return Promise.reject('Instance not available - cannot complete the calculation');
    },
  })
  doComplexRequestTransformation(
    @RequestBody _requestBody: FourNumberCollection,
  ): ApiResponse<HttpBinResponse> {}
}
