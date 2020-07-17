import { PrivateBasicAuthApiDataStore } from './PrivateBasicAuthApiDataStore';

const validDataStore = new PrivateBasicAuthApiDataStore('good_username', 'good_password');
const invalidDataStore = new PrivateBasicAuthApiDataStore('bogus_u1', 'bogus_pwd1');

describe('PrivateBasicAuthApiDataStore', () => {
  it('Simple Basic Auth Private Authenticated API Should work with good credentials', () => {
    const apiResponse = validDataStore.doApiCallWithBasicUsernameAndPassword();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.user).toEqual('good_username');
      });
    }
  });

  it('Simple Basic Auth Private Authenticated API Should fail with bad credentials', () => {
    const apiResponse = invalidDataStore.doApiCallWithBasicUsernameAndPassword();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(401);
        expect(apiResponse.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');
      });
    }
  });
});
