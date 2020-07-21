import { PathParamApiDataStore } from './PathParamApiDataStore';

const myApiInstance = new PathParamApiDataStore('mySecretCookie');

// NOTE: this test can only be run against the custom server which we have here in this repo.
// to run this test, start that Node server and remove the `skip` to re-run the test
describe('PathParamApiDataStore', () => {
  it('Complicated path params from method parameters and class members should work', () => {
    const apiResponse = myApiInstance.doGet('mySecretValue_123_456_789');

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(apiResponse.retryCount).toBeGreaterThan(0);
        expect(apiResponse.url).toEqual(
          'https://httpbin.org/cookies/set/mySecretCookie/mySecretValue_123_456_789',
        );
      });
    }
  });
});
