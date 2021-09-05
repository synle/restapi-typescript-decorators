import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';

const testAccessToken = '<<some_strong_and_random_access_token>>';

const myBadApiInstance = new PrivateBearerAuthApiDataStore('');
const myGoodApiInstance = new PrivateBearerAuthApiDataStore(testAccessToken);

describe('PrivateBearerAuthApiDataStore', () => {
  it('Private Authenticated API Should work with correct access token', () => {
    const apiResponse = myGoodApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp.config.url).toBe('https://httpbin.org/bearer');
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.token).toEqual(testAccessToken);
      });
    }
  });

  it('Private Authenticated API Should fail with no access token', () => {
    const apiResponse = myBadApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.catch((resp) => {
        expect(resp.config.url).toBe('https://httpbin.org/bearer');
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(false);
        expect(resp.status).toBe(401);
        expect(resp.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');
      });
    }
  });
});
