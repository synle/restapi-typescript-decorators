import { PublicApiDataStore } from './PublicApiDataStore';
import fs from 'fs';

const myApiInstance = new PublicApiDataStore();
const sampleTextFile = 'SampleSms.txt';

describe('PublicApiDataStore', () => {
  it('POST with JSON @RequestBody should work', () => {
    const apiResponse = myApiInstance.doPostWithJsonBody({ a: 1, b: 2, c: 3 });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.json).toEqual({ a: 1, b: 2, c: 3 });
        expect(resp.url).toEqual('https://httpbin.org/post');
      });
    }
  });

  it('POST with encoded form @RequestBody should work', () => {
    const apiResponse = myApiInstance.doPostWithEncodedFormData({
      a: 1,
      b: 2,
      c: 3,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.form).toEqual({ a: '1', b: '2', c: '3' });
        expect(resp.url).toEqual('https://httpbin.org/post');
      });
    }
  });

  it('GET with query params should work', () => {
    const apiResponse = myApiInstance.doGetWithQueryParams({ a: 1, b: 2, c: 3 });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.args).toEqual({ a: '1', b: '2', c: '3' });
        expect(resp.url).toEqual('https://httpbin.org/get?a=1&b=2&c=3');
      });
    }
  });

  it('GET with absolute URL should work', () => {
    const apiResponse = myApiInstance.doGetWithAbsoluteUrl();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.url).toEqual('https://httpbin.org/get');
      });
    }
  });

  it('GET with path params and query params should work', () => {
    const apiResponse = myApiInstance.doGetWithPathParamsAndQueryParams('secret_message_id_123', {
      aa: 1,
      bb: 2,
      cc: 3,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.args).toEqual({ aa: '1', bb: '2', cc: '3' });
        expect(resp.url).toEqual(
          'https://httpbin.org/anything/secret_message_id_123?aa=1&bb=2&cc=3',
        );
      });
    }
  });

  it('POST with form data should work', () => {
    const apiResponse = myApiInstance.doPostWithFormBodyData(
      123, // unit price
      100, // qty
    );

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);

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

  it('POST to upload binary file using form data should work', () => {
    const sampleSmsFileStream = fs.createReadStream(sampleTextFile);

    const apiResponse = myApiInstance.doUploadFileWithFormBodyData(sampleSmsFileStream);

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.data).toEqual('[object FormData]');
      });
    }
  });

  it('POST to upload binary file using a single stream should work', () => {
    const sampleSmsFileStream = fs.createReadStream(sampleTextFile);

    const apiResponse = myApiInstance.doUploadFileWithStreamRequest(sampleSmsFileStream);

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.data).toMatchSnapshot();
      });
    }
  });

  it('Simple Timeout API HTTP GET should work', (done) => {
    const apiResponse = myApiInstance.doGetWithTimeout();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then(
        () => {
          done.fail(new Error('This is the error'));
        },
        () => {
          expect(apiResponse.ok).toBe(false);
          done();
        },
      );
    }
  });

  it('Simple Erroneous API HTTP GET should always fail', () => {
    const apiResponse = myApiInstance.doErroneousAPI();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.catch((resp) => {
        expect(apiResponse.ok).toBe(false);
        expect(apiResponse.status).toBe(405);
        expect(resp).toEqual('');
      });
    }
  });

  it('`brotli` Accept-Encoding should work', () => {
    const apiResponse = myApiInstance.doGetWithResponseEncoding('brotli');

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.brotli).toBe(true);
      });
    }
  });

  it('`deflate` Accept-Encoding should work', () => {
    const apiResponse = myApiInstance.doGetWithResponseEncoding('deflate');

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.deflated).toBe(true);
      });
    }
  });

  it('`gzip` Accept-Encoding should work', () => {
    const apiResponse = myApiInstance.doGetWithResponseEncoding('gzip');

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.gzipped).toBe(true);
      });
    }
  });

  it('Simple XML Response should work', () => {
    const apiResponse = myApiInstance.doGetWithXmlResponse();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp).toMatchSnapshot();
      });
    }
  });
});
