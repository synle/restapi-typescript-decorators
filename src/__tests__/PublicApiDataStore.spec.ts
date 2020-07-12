import { ApiResponse } from '../index';
import { PublicApiDataStore } from './PublicApiDataStore';

const unAuthDataStoreInstance = new PublicApiDataStore();

test('Simple Public HTTP POST should work', () => {
  const apiResponse = <ApiResponse>(
    unAuthDataStoreInstance.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
  );

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toEqual(200);
    expect(resp.json).toEqual({ a: 1, b: 2, c: 3 });
    expect(resp.url).toEqual('https://httpbin.org/post');
  });
});

test('Simple Public HTTP GET with query params should work', () => {
  const apiResponse = <ApiResponse>unAuthDataStoreInstance.doSimpleHttpBinGet({ a: 1, b: 2, c: 3 });

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toEqual(200);
    expect(resp.args).toEqual({ a: '1', b: '2', c: '3' });
    expect(resp.url).toEqual('https://httpbin.org/get?a=1&b=2&c=3');
  });
});

test('Simple Public HTTP GET with path params and query params should work', () => {
  const apiResponse = <ApiResponse>unAuthDataStoreInstance.doSimpleHttpBinPathParamsGet(
    'secret_message_id_123',
    {
      aa: 1,
      bb: 2,
      cc: 3,
    },
  );

  return apiResponse.result.then((resp) => {
    expect(apiResponse.status).toEqual(200);
    expect(resp.args).toEqual({ aa: '1', bb: '2', cc: '3' });
    expect(resp.url).toEqual('https://httpbin.org/anything/secret_message_id_123?aa=1&bb=2&cc=3');
  });
});
