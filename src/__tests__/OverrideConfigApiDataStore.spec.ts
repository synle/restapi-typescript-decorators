import { OverrideConfigApiDataStore } from './OverrideConfigApiDataStore';

const myOverrideConfigApiDataStoreInstance = new OverrideConfigApiDataStore();

test('Simple Override Config from @RestApi API should work', () => {
  const apiResponse = myOverrideConfigApiDataStoreInstance.doSimplePostWithCustomRestApiConfig();

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
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
    });
  }
});

test('Simple Override Config from @RestClient API should work', () => {
  const apiResponse = myOverrideConfigApiDataStoreInstance.doSimplePostWithCustomRestClientConfig();

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
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
    });
  }
});
