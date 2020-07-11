import { RestApi, ApiResponse } from "./index";

class DataStore {
  @RestApi("https://api.github.com/users/github")
  static getGithubProfile(): any {}

  @RestApi("https://httpbin.org/post", {
    method: "POST",
  })
  static doSimpleHttpBinPost(_body): any {}
}

const githubProfileResp = <ApiResponse>DataStore.getGithubProfile();
githubProfileResp.result.then(
  (resp) => console.log("DataStore.getGithubProfile", githubProfileResp.status, resp)
)

githubProfileResp.abort();// to abort the request


const doSimpleHttpBinPostResp = <ApiResponse>(
  DataStore.doSimpleHttpBinPost(JSON.stringify({ a: 1, b: 2, c: 3 }))
);
doSimpleHttpBinPostResp.result.then((resp) =>
  console.log(
    "DataStore.doSimpleHttpBinPost",
    doSimpleHttpBinPostResp.status,
    resp
  )
);
