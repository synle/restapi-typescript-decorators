import { ApiResponse } from '../index';
import { PrivateBasicAuthApiDataStore } from './PrivateBasicAuthApiDataStore';

const validDataStore = new PrivateBasicAuthApiDataStore('good_username', 'good_password');
const invalidDataStore = new PrivateBasicAuthApiDataStore('bogus_u1', 'bogus_pwd1');

test('Simple Basic Auth Private Authenticated API Should work with good credentials', () => {
  const apiResponse = <ApiResponse>validDataStore.doApiCallWithBasicUsernameAndPassword();

  return apiResponse.result.then((resp) => {
    expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(200);
    expect(resp.authenticated).toBe(true);
    expect(resp.user).toEqual('good_username');
  });
});

test('Simple Basic Auth Private Authenticated API Should fail with bad credentials', () => {
  const apiResponse = <ApiResponse>invalidDataStore.doApiCallWithBasicUsernameAndPassword();
  return apiResponse.result.then((resp) => {
    expect(apiResponse.url).toBe('https://httpbin.org/basic-auth/good_username/good_password');
    expect(apiResponse.ok).toBe(false);
    expect(apiResponse.status).toBe(401);
    expect(apiResponse.statusText).toBe('UNAUTHORIZED');
    expect(resp).toBe('');
  });
});
