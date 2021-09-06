import { PrivateBasicAuthApiDataStore } from './PrivateBasicAuthApiDataStore';

const myGoodApiInstance = new PrivateBasicAuthApiDataStore('good_username', 'good_password');
const myBadApiInstanceBogusCreds = new PrivateBasicAuthApiDataStore('bogus_u1', 'bogus_pwd1');
const myBadApiInstanceEmptyCreds = new PrivateBasicAuthApiDataStore('', '');

describe('PrivateBasicAuthApiDataStore', () => {
  it('Basic Auth Private Authenticated API Should work with good credentials', (done) => {
    const apiResponse = myGoodApiInstance.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.authenticated).toBe(true);
        expect(resp.user).toEqual('good_username');

        done();
      });
    }
  });

  it('Basic Auth Private Authenticated API Should fail with bad credentials', (done) => {
    const apiResponse = myBadApiInstanceBogusCreds.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.catch((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(401);
        expect(apiResponse.statusText).toBe('UNAUTHORIZED');

        done();
      });
    }
  });

  it('Basic Auth Private Authenticated API Should fail with empty credentials', (done) => {
    const apiResponse = myBadApiInstanceEmptyCreds.doAuthenticatedCall();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.catch((resp) => {
        expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(401);
        expect(apiResponse.statusText).toBe('UNAUTHORIZED');

        done();
      });
    }
  });
});
