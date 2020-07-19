import { RetryDataStore } from './RetryDataStore';

const myApiInstance = new RetryDataStore();

// NOTE: this test can only be run against the custom server which we have here in this repo.
// to run this test, start that Node server and remove the `skip` to re-run the test
describe.skip('RetryDataStore', () => {
  it('Simple API Retry should work', () => {
    const apiResponse = myApiInstance.doApiWithRetry();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.retryCount).toBeGreaterThan(0);
        expect(resp).toEqual({ code: 'OK', message: 'SUCCESS' });
      });
    }
  });
});
