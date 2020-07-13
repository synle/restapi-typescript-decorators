import { RestClient, RestApi, RequestBody, PathParam, QueryParams } from '../index';

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

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TransformationApiDataStore {
  // this example will transform the request to make a and b and multiply
  // them by 100 and 200 respectively before sending them to the back end
  @RestApi('/anything', {
    method: 'POST',
    request_transform: (
      fetchOptions: Request,
      pair: NumberPair,
      instance: TransformationApiDataStore,
    ): Promise<Request> => {
      const newBody = {
        a: pair.a * 100,
        b: pair.b * 200,
      };

      return Promise.resolve(
        Object.assign(fetchOptions, {
          body: JSON.stringify(newBody),
        }),
      );
    },
  })
  doSimpleRequestTransformApi(@RequestBody requestBody: NumberPair): any {}

  // this example will make the api response to the backend
  // then transform the returned data by adding the 2 numbers a and b
  // and return the result as a sum
  @RestApi('/anything', {
    method: 'POST',
    response_transform: (
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
  doSimpleResponseTransformApi(@RequestBody requestBody: NumberPair): any {}

  // this example will attempt making 2 async calls for 2 sums and then add them up
  // in the request body before sending them out to the backend
  @RestApi('/anything', {
    method: 'POST',
    request_transform: (
      fetchOptions: Request,
      fourNumbers: FourNumberCollection,
      instance: TransformationApiDataStore,
    ): Promise<Request> => {
      const { a, b, c, d } = fourNumbers;

      return Promise.all([
        instance.doSimpleResponseTransformApi({ a: a, b: b }).result,
        instance.doSimpleResponseTransformApi({ a: c, b: d }).result,
      ]).then(([res1, res2]) => {
        console.log(res1, res2);
        const sum1 = res1.sum;
        const sum2 = res2.sum;
        const totalAmount = sum1 + sum2;
        const newBody = { totalAmount, sum1, sum2 };

        return Promise.resolve(
          Object.assign(fetchOptions, {
            body: JSON.stringify(newBody),
          }),
        );
      });
    },
  })
  doComplexRequestTransformation(@RequestBody requestBody: FourNumberCollection): any {}
}
