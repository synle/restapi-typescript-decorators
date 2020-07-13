import { OverrideTransformDataStore } from './OverrideTransformDataStore';

const myOverrideTransformDataStoreInstance = new OverrideTransformDataStore();

test('Simple Override of Transformation at @RestClient should work - example 1', () => {
  const apiResponse = myOverrideTransformDataStoreInstance.doSimpleHttpBinPost({
    a: 1,
    b: 2,
    c: 3,
  });

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp).toEqual(['a', 'b', 'c']);
    });
  }
});

test('Simple Override of Transformation at @RestClient should work - example 2', () => {
  const apiResponse = myOverrideTransformDataStoreInstance.doSimpleHttpBinGet({ d: 4, e: 5, f: 6 });

  expect(apiResponse).toBeDefined();

  if (apiResponse) {
    return apiResponse.result.then((resp) => {
      expect(apiResponse.ok).toBe(true);
      expect(apiResponse.status).toEqual(200);
      expect(resp).toEqual(['d', 'e', 'f']);
    });
  }
});
