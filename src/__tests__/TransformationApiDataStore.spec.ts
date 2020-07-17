import { TransformationApiDataStore } from './TransformationApiDataStore';

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();

describe('TransformationApiDataStore', () => {
  it('Simple Request Transformation API should work - transform before request is sent', () => {
    const apiResponse = myTransformationApiDataStoreInstance.doSimpleRequestTransformApi({
      a: 1,
      b: 2,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.request_body).toEqual('{"a":100,"b":400}');
        expect(resp.json).toEqual({ a: 100, b: 400 });
      });
    }
  });

  it('Simple Request Transformation API should work - transform before response is returned', () => {
    const apiResponse = myTransformationApiDataStoreInstance.doSimpleResponseTransformApi({
      a: 300,
      b: 700,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(resp).toEqual({ sum: 1000 });
      });
    }
  });

  it('Simple Request Transformation API should work - complex API transform before response is returned', () => {
    const apiResponse = myTransformationApiDataStoreInstance.doComplexRequestTransformation({
      a: 100,
      b: 200,
      c: 300,
      d: 400,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(resp.json).toEqual({ sum: 1000 });
      });
    }
  });
});
