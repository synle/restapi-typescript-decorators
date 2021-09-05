import { OverrideConfigApiDataStore } from './OverrideConfigApiDataStore';

const myApiInstance = new OverrideConfigApiDataStore();

describe('OverrideConfigApiDataStore', () => {
  it('Override Config from @RestApi API should work', (done) => {
    const apiResponse = myApiInstance.doPostWithCustomRestApiConfig();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(resp).toBeDefined();

        if (resp) {
          const { headers } = resp;

          if (headers) {
            expect(headers['Accept']).toEqual('application/json');
            expect(headers['--Rest-Client-Custom-Header']).toEqual('<some_value_@Restclient_111>');
            expect(headers['--Rest-Api-Custom-Header']).toEqual('<some_value_@RestApi_222>');
            expect(headers['Content-Type']).toEqual('<some_value_@RestApi_333>');
            expect(headers['Accept-Encoding']).toEqual('UTF8');
          }
        }
        done();
      });
    }
  });

  it('Override Config from @RestClient API should work', (done) => {
    const apiResponse = myApiInstance.doPostWithCustomRestClientConfig();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(resp).toBeDefined();

        if (resp) {
          const { headers } = resp;

          if (headers) {
            expect(headers['Accept']).toEqual('application/json');
            expect(headers['--Rest-Client-Custom-Header']).toEqual('<some_value_@Restclient_111>');
            expect(headers['--Rest-Api-Custom-Header']).toEqual('<this_value_will_overrided>');
            expect(headers['Accept-Encoding']).toEqual('ASCII');
          }
        }
        done();
      });
    }
  });
});
