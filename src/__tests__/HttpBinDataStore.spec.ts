import { ApiResponse } from '../index';
import { HttpBinDataStore } from './HttpBinDataStore';

let dataStoreInstance = new HttpBinDataStore();

test('httpBinDataStore.doSimpleHttpBinPost', () => {
  const doSimpleHttpBinPostResp = <ApiResponse>(
    dataStoreInstance.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
  );

  return doSimpleHttpBinPostResp.result.then((resp) => {
    expect(doSimpleHttpBinPostResp.status).toEqual(200);
    expect(resp.json).toEqual({ a: 1, b: 2, c: 3 });
    expect(resp.url).toEqual('https://httpbin.org/post');
  });
});

test('httpBinDataStore.doSimpleHttpBinGet', () => {
  const doSimpleHttpBinGetResp = <ApiResponse>(
    dataStoreInstance.doSimpleHttpBinGet({ a: 1, b: 2, c: 3 })
  );

  return doSimpleHttpBinGetResp.result.then((resp) => {
    expect(doSimpleHttpBinGetResp.status).toEqual(200);
    expect(resp.args).toEqual({ a: '1', b: '2', c: '3' });
    expect(resp.url).toEqual('https://httpbin.org/get?a=1&b=2&c=3');
  });
});

test('httpBinDataStore.doSimpleHttpBinPathParamsGetResp', () => {
  const doSimpleHttpBinPathParamsGetResp = <ApiResponse>(
    dataStoreInstance.doSimpleHttpBinPathParamsGet('secret_message_id_123', {
      aa: 1,
      bb: 2,
      cc: 3,
    })
  );

  return doSimpleHttpBinPathParamsGetResp.result.then((resp) => {
    expect(doSimpleHttpBinPathParamsGetResp.status).toEqual(200);
    expect(resp.args).toEqual({ aa: '1', bb: '2', cc: '3' });
    expect(resp.url).toEqual('https://httpbin.org/anything/secret_message_id_123?aa=1&bb=2&cc=3');
  });
});
