import { RestApi, RequestBody, PathParam,ApiResponse } from "./index";

class DataStore {
  @RestApi("https://api.github.com/users/github")
  static getGithubProfile(): any {}

  @RestApi("https://httpbin.org/post", {
    method: "POST",
  })
  static doSimpleHttpBinPost(@RequestBody _body): any {}

  @RestApi("https://httpbin.org/get")
  static doSimpleHttpBinGet(@RequestBody _body): any {}

  @RestApi("https://httpbin.org/anything/{messageId}")
  static doSimpleHttpBinPathParamsGet(
    @PathParam('messageId') targetMessageId,
    @RequestBody _body
  ): any {}
}

// https://httpbin.org/anything/123456

// const githubProfileResp = <ApiResponse>DataStore.getGithubProfile();
// githubProfileResp.result.then(
//   (resp) => console.log("DataStore.getGithubProfile", githubProfileResp.status, resp)
// )
// // githubProfileResp.abort();// to abort the request
//
//
// const doSimpleHttpBinPostResp = <ApiResponse>(
//   DataStore.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
// );
// doSimpleHttpBinPostResp.result.then((resp) =>
//   console.log(
//     "DataStore.doSimpleHttpBinPost",
//     doSimpleHttpBinPostResp.status,
//     resp
//   )
// );


// const doSimpleHttpBinGetResp = <ApiResponse>(
//   DataStore.doSimpleHttpBinGet( { a: 1, b: 2, c: 3 })
// );
// doSimpleHttpBinGetResp.result.then((resp) =>
//   console.log(
//     "DataStore.doSimpleHttpBinGet",
//     doSimpleHttpBinGetResp.status,
//     resp
//   )
// );

const doSimpleHttpBinPathParamsGetResp = <ApiResponse>(
  DataStore.doSimpleHttpBinPathParamsGet('secret_message_id_123', { a: 1, b: 2, c: 3 })
);
doSimpleHttpBinPathParamsGetResp.result.then((resp) =>
  console.log(
    "DataStore.doSimpleHttpBinPathParamsGet",
    doSimpleHttpBinPathParamsGetResp.status,
    resp
  )
);
