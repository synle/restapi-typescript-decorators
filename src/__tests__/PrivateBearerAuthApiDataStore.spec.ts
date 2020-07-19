import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';

const testAccessToken = '<<some_strong_and_random_access_token>>';

const invalidDataStore = new PrivateBearerAuthApiDataStore('');
const validDataStore = new PrivateBearerAuthApiDataStore(testAccessToken);

describe('PrivateBearerAuthApiDataStore', () => {
  it('Simple Private Authenticated API Should work with correct access token', () => {
    const apiResponse = validDataStore.doApiCallWithBearerToken();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/bearer');
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.token).toEqual(testAccessToken);
      });
    }
  });

  it('Simple Private Authenticated API Should fail with no access token', () => {
    const apiResponse = invalidDataStore.doApiCallWithBearerToken();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.catch((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/bearer');
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(401);
        expect(apiResponse.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');
      });
    }
  });
});
