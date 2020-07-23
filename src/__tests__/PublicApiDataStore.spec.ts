import { PublicApiDataStore } from './PublicApiDataStore';
import fs from 'fs';

const myApiInstance = new PublicApiDataStore();
const sampleTextFile = 'SampleSms.txt';

describe('PublicApiDataStore', () => {
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

  it('GET with single path params', () => {
    const apiResponse = myApiInstance.doGetWithSingleQueryParam('javascript', 20);

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.args).toEqual({ keyword: 'javascript', pageSize: '20' });
        expect(resp.url).toContain('keyword=javascript');
        expect(resp.url).toContain('pageSize=20');
      });
    }
  });

  it('GET with query params combo (hash and single value) should work', () => {
    const apiResponse = myApiInstance.doGetWithQueryParamsCombo(
      {
        city: 'San Francisco',
        radius: '< 2 miles',
        price: '< 4000',
      },
      20, // page size
    );

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.args).toEqual({
          city: 'San Francisco',
          pageSize: '20',
          price: '< 4000',
          radius: '< 2 miles',
        });
        expect(resp.url).toContain('city=San Francisco');
        expect(resp.url).toContain('radius=< 2 miles');
        expect(resp.url).toContain('price=< 4000');
        expect(resp.url).toContain('pageSize=20');
      });
    }
  });

  it('GET with path params should work', () => {
    const apiResponse = myApiInstance.doGetWithPathParams('92a38a41-0a47-4651-8253-c329af28a723');

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.url).toEqual(
          'https://httpbin.org/anything/92a38a41-0a47-4651-8253-c329af28a723',
        );
      });
    }
  });

  it('POST with JSON @RequestBody (as a hash) should work', () => {
    const apiResponse = myApiInstance.doPostWithJsonBodyHash({ a: 1, b: 2, c: 3 });

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

  it('POST with JSON @RequestProperty (as a single value) should work', () => {
    const apiResponse = myApiInstance.doPostWithSingleValuesJsonBody(
      'Sy', // first name
      'Le', // last name
    );

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.json).toEqual({ firstName: 'Sy', lastName: 'Le' });
        expect(resp.url).toEqual('https://httpbin.org/post');
      });
    }
  });

  it('POST with JSON body combo of @RequestProperty (as a single value) and @RequestProperty (as a single value) should work', () => {
    const apiResponse = myApiInstance.doPostWithJsonBodyMixture(
      {
        oldPassword: '123',
        newPassword: '456',
      },
      '5d3fd566-a3d7-4d44-994c-a4cee8d53f63', // userId
    );

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toBe(200);
        expect(resp.json).toEqual({
          newPassword: '456',
          oldPassword: '123',
          userId: '5d3fd566-a3d7-4d44-994c-a4cee8d53f63',
        });
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

  it('Simple Plain Text Response should work', () => {
    const apiResponse = myApiInstance.doGetWithPlainTextResponse();

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
