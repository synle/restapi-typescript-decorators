import { OverrideTransformDataStore } from './OverrideTransformDataStore';

const myApiInstance = new OverrideTransformDataStore();

describe('OverrideTransformDataStore', () => {
  it('Override of Transformation at @RestClient should work - example 1', () => {
    const apiResponse = myApiInstance.doPost({
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

  it('Override of Transformation at @RestClient should work - example 2', () => {
    const apiResponse = myApiInstance.doGet({
      d: 4,
      e: 5,
      f: 6,
    });

    expect(apiResponse).toBeDefined();

    if (apiResponse) {
      return apiResponse.result.then((resp) => {
        expect(apiResponse.ok).toBe(true);
        expect(apiResponse.status).toEqual(200);
        expect(resp).toEqual(['d', 'e', 'f']);
      });
    }
  });
});
