import { PublicApiDataStore } from './PublicApiDataStore';
import fs from 'fs';

const myPublicDataStoreInstance = new PublicApiDataStore();
const sampleTextFile = 'SampleSms.txt';

test('Simple Public HTTP POST should work', () => {
  const apiResponse = myPublicDataStoreInstance.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 });

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp.json).toEqual({ a: 1, b: 2, c: 3 });
      expect(resp.url).toEqual('https://httpbin.org/post');
    });
  }
});

test('Simple Public HTTP GET with query params should work', () => {
  const apiResponse = myPublicDataStoreInstance.doSimpleHttpBinGet({ a: 1, b: 2, c: 3 });

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp.args).toEqual({ a: '1', b: '2', c: '3' });
      expect(resp.url).toEqual('https://httpbin.org/get?a=1&b=2&c=3');
    });
  }
});

test('Simple Public HTTP GET with path params and query params should work', () => {
  const apiResponse = myPublicDataStoreInstance.doSimpleHttpBinPathParamsGet(
    'secret_message_id_123',
    {
      aa: 1,
      bb: 2,
      cc: 3,
    },
  );

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp.args).toEqual({ aa: '1', bb: '2', cc: '3' });
      expect(resp.url).toEqual('https://httpbin.org/anything/secret_message_id_123?aa=1&bb=2&cc=3');
    });
  }
});

test('Simple Public HTTP POST with form data should work', () => {
  const apiResponse = myPublicDataStoreInstance.doSimpleFormDataHttpBinPost(
    123, // unit price
    100, // qty
  );

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);

      const respJson = <{ [propName: string]: any }>resp.json;

      expect(respJson).toBeDefined();

      if (respJson) {
        const dataStream = respJson['_streams'].join('');
        expect(dataStream).toContain('Content-Disposition: form-data; name="quantity"');
        expect(dataStream).toContain('100');
        expect(dataStream).toContain('Content-Disposition: form-data; name="unitPrice"');
        expect(dataStream).toContain('123');
      }
    });
  }
});

test('Simple Public HTTP POST to upload binary file using form data should work', () => {
  const sampleSmsFileStream = fs.createReadStream(sampleTextFile);

  const apiResponse = myPublicDataStoreInstance.doSimpleUploadFileHttpBinPost(sampleSmsFileStream);

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp.data).toEqual('[object FormData]');
    });
  }
});

test('Simple Public HTTP POST to upload binary file using a single stream should work', () => {
  const sampleSmsFileStream = fs.createReadStream(sampleTextFile);

  const apiResponse = myPublicDataStoreInstance.doSimpleUploadFileWithStreamHttpBinPost(
    sampleSmsFileStream,
  );

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp.data).toContain(`Hello world, this is a test. 123. ping. pong`);
    });
  }
});
