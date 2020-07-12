import { ApiResponse } from '../index';
import { BearerTokenDataStore } from './BearerTokenDataStore';

const testAccessToken = '<<strong_some_access_token>>';

const invalidDataStore = new BearerTokenDataStore('');
const validDataStore = new BearerTokenDataStore(testAccessToken);

test('Simple Private Authenticated API Should work with correct access token', () => {
  const apiResponse = <ApiResponse>validDataStore.doApiCallWithBearerToken();

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toEqual(200);
    expect(resp.authenticated).toEqual(true);
    expect(resp.token).toEqual(testAccessToken);
  });
});

test('Simple Private Authenticated API Should fail with no access token', () => {
  const apiResponse = <ApiResponse>invalidDataStore.doApiCallWithBearerToken();

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toEqual(401);
    expect(resp.authenticated).toEqual(true);
    expect(resp.token).toEqual(testAccessToken);
  });
});
