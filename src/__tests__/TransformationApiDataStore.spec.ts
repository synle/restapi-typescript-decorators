import { TransformationApiDataStore } from './TransformationApiDataStore';

const myApiInstance = new TransformationApiDataStore();

describe('TransformationApiDataStore', () => {
  it('Request Transformation API should work - transform before request is sent', () => {
    const apiResponse = myApiInstance.doRequestTransformApi({
      a: 1,
      b: 2,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toEqual(200);
        expect(apiResponse.requestBody).toEqual('{"a":100,"b":400}');
        expect(resp.json).toEqual({ a: 100, b: 400 });
      });
    }
  });

  it('Request Transformation API should work - transform before response is returned', () => {
    const apiResponse = myApiInstance.doResponseTransformApi({
      a: 300,
      b: 700,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toEqual(200);
        expect(resp).toEqual({ sum: 1000 });
      });
    }
  });

  it('Request Transformation API should work - complex API transform before response is returned', () => {
    const apiResponse = myApiInstance.doComplexRequestTransformation({
      a: 100,
      b: 200,
      c: 300,
      d: 400,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toEqual(200);
        expect(resp.json).toEqual({ sum: 1000 });
      });
    }
  });
});
