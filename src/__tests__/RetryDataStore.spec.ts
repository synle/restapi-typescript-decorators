import { RetryDataStore } from './RetryDataStore';

const myApiInstance = new RetryDataStore();

describe('RetryDataStore', () => {
  it('Simple API Retry', () => {
    const apiResponse = myApiInstance.doApiWithRetry();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.requestBody).toEqual('{"a":100,"b":400}');
        expect(resp.json).toEqual({ a: 100, b: 400 });
      });
    }
  });
});
