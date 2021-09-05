import { RetryDataStore } from './RetryDataStore';

const myApiInstance = new RetryDataStore();

// NOTE: this test can only be run against the custom server which we have here in this repo.
// to run this test, start that Node server and remove the `skip` to re-run the test
describe('RetryDataStore', () => {
  it('API Retry with fixed delay should work', (done) => {
    const apiResponse = myApiInstance.doApiWithFixedRetryAfter();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.retryCount).toBeGreaterThan(0);
        expect(resp).toEqual({ code: 'OK', message: 'SUCCESS' });

        done();
      });
    }
  });

  it('API Retry that respects server `Retry-After` response header should work', (done) => {
    const apiResponse = myApiInstance.doApiWithRetryAfterAsSeconds();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.retryCount).toBeGreaterThan(0);
        expect(resp).toEqual({ code: 'OK', message: 'SUCCESS' });

        done();
      });
    }
  });
});
