import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';

const testAccessToken = '<<some_strong_and_random_access_token>>';

const myBadApiInstance = new PrivateBearerAuthApiDataStore('');
const myGoodApiInstance = new PrivateBearerAuthApiDataStore(testAccessToken);

describe('PrivateBearerAuthApiDataStore', () => {
  it('Private Authenticated API Should work with correct access token', (done) => {
    const apiResponse = myGoodApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/bearer');
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.token).toEqual(testAccessToken);

        done();
      });
    }
  });

  it('Private Authenticated API Should fail with no access token', (done) => {
    const apiResponse = myBadApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.catch((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/bearer');
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(401);
        expect(apiResponse.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');

        done();
      });
    }
  });
});
