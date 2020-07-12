import { ApiResponse } from "../index";
import { BearerTokenDataStore } from "./BearerTokenDataStore";

const testAccessToken = "<<strong_some_access_token>>";

const validDataStore = new BearerTokenDataStore();
// validDataStore.setAccessToken("");

const invalidDataStore = new BearerTokenDataStore();
invalidDataStore.accessToken = testAccessToken;

const doApiCallWithBearerTokenResp = <ApiResponse>(
  invalidDataStore.doApiCallWithBearerToken()
);

doApiCallWithBearerTokenResp.result.then(resp => {
  console.log(doApiCallWithBearerTokenResp.status);
  console.log(doApiCallWithBearerTokenResp.request_headers);
  console.log(resp);
});

// test("BearerTokenDataStore.doApiCallWithBearerToken", () => {
//   const doApiCallWithBearerTokenResp = <ApiResponse>(
//     validDataStore.doApiCallWithBearerToken()
//   );

//   return doApiCallWithBearerTokenResp.result.then(resp => {
//     expect(doApiCallWithBearerTokenResp.status).toEqual(401);
//     expect(resp).toEqual("");
//   });
// });

// test("BearerTokenDataStore.doApiCallWithBearerToken", () => {
//   const doApiCallWithBearerTokenResp = <ApiResponse>(
//     validDataStore.doApiCallWithBearerToken()
//   );

//   return doApiCallWithBearerTokenResp.result.then(resp => {
//     expect(doApiCallWithBearerTokenResp.status).toEqual(401);
//     expect(resp).toEqual("");
//   });
// });
