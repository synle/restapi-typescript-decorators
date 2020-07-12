import { ApiResponse } from '../index';
import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';

const testAccessToken = '<<some_strong_and_random_access_token>>';

const invalidDataStore = new PrivateBearerAuthApiDataStore('');
const validDataStore = new PrivateBearerAuthApiDataStore(testAccessToken);

test('Simple Private Authenticated API Should work with correct access token', () => {
  const apiResponse = <ApiResponse>validDataStore.doApiCallWithBearerToken();

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toBe(200);
    expect(resp.authenticated).toBe(true);
    expect(resp.token).toEqual(testAccessToken);
  });
});

test('Simple Private Authenticated API Should fail with no access token', () => {
  const apiResponse = <ApiResponse>invalidDataStore.doApiCallWithBearerToken();
  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toBe(401);
    expect(resp).toBe('');
  });
});
