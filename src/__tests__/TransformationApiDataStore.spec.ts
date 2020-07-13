import { ApiResponse } from '../index';
import { TransformationApiDataStore } from './TransformationApiDataStore';

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();

test('Simple Request Transformation API should work - transform before request is sent', () => {
  const apiResponse = <ApiResponse>(
    myTransformationApiDataStoreInstance.doSimpleRequestTransformApi({ a: 1, b: 2 })
  );

  return apiResponse.result.then((resp) => {
    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toEqual(200);
    expect(apiResponse.request_body).toEqual('{"a":100,"b":400}');
    expect(resp.json).toEqual({ a: 100, b: 400 });
  });
});

test('Simple Request Transformation API should work - transform before response is returned', () => {
  const apiResponse = <ApiResponse>(
    myTransformationApiDataStoreInstance.doSimpleResponseTransformApi({ a: 300, b: 700 })
  );

  return apiResponse.result.then((resp) => {
    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toEqual(200);
    expect(resp).toEqual({ sum: 1000 });
  });
});
