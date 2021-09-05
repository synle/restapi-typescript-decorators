import { PrivateBasicAuthApiDataStore } from './PrivateBasicAuthApiDataStore';

const myGoodApiInstance = new PrivateBasicAuthApiDataStore('good_username', 'good_password');
const myBadApiInstanceBogusCreds = new PrivateBasicAuthApiDataStore('bogus_u1', 'bogus_pwd1');
const myBadApiInstanceEmptyCreds = new PrivateBasicAuthApiDataStore('', '');

describe('PrivateBasicAuthApiDataStore', () => {
  it('Basic Auth Private Authenticated API Should work with good credentials', () => {
    const apiResponse = myGoodApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp.config.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.user).toEqual('good_username');
      });
    }
  });

  it('Basic Auth Private Authenticated API Should fail with bad credentials', () => {
    const apiResponse = myBadApiInstanceBogusCreds.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.catch((resp) => {
        expect(resp.config.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(false);
        expect(resp.status).toBe(401);
        expect(resp.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');
      });
    }
  });

  it('Basic Auth Private Authenticated API Should fail with empty credentials', () => {
    const apiResponse = myBadApiInstanceEmptyCreds.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.catch((resp) => {
        expect(resp.config.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(false);
        expect(resp.status).toBe(401);
        expect(resp.statusText).toBe('UNAUTHORIZED');
        expect(resp).toBe('');
      });
    }
  });
});
