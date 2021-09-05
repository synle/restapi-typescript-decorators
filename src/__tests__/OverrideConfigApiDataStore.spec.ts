import { OverrideConfigApiDataStore } from './OverrideConfigApiDataStore';

const myApiInstance = new OverrideConfigApiDataStore();

describe('OverrideConfigApiDataStore', () => {
  it('Override Config from @RestApi API should work', () => {
    const apiResponse = myApiInstance.doPostWithCustomRestApiConfig();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toEqual(200);
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
      });
    }
  });

  it('Override Config from @RestClient API should work', () => {
    const apiResponse = myApiInstance.doPostWithCustomRestClientConfig();

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.promise.then((resp) => {
        expect(resp && resp.status === 200 && resp.statusText === 'OK').toBe(true);
        expect(resp.status).toEqual(200);
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
      });
    }
  });
});
