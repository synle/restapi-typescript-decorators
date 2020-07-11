# restapi-typescript-decorators
This decorator is used to make REST api calls simpler. The goal is to create a single decorator for both node js and front end.

### TODO's
- [X] Supports abort
- [X] Supports proper serialization of request based on headers accept
- [X] Allows custom serialization for request
- [X] Allows custom deserialization for response
- [ ] Document steps for custom serialization and deserialization
- [ ] Deploy to npm modules instead of using github
- [ ] Integrate with CI pipeline to build stuffs automatically

### How to use
#### Install it
```
npm install --save synle/restapi-typescript-decorators#1.0.0
```

Make sure you have the typescript and decorator enabled in your `tsconfig.json`

#### Code sample
```
import { RestApi, ApiResponse } from "restapi-typescript-decorators";

class DataStore {
  @RestApi("https://api.github.com/users/github")
  static getGithubProfile(): any {}

  @RestApi("https://httpbin.org/post", {
    method: "POST",
  })
  static doSimpleHttpBinPost(_body): any {}

  @RestApi("https://httpbin.org/get")
  static doSimpleHttpBinGet(_body): any {}
}

const githubProfileResp = <ApiResponse>DataStore.getGithubProfile();
githubProfileResp.result.then(
  (resp) => console.log("DataStore.getGithubProfile", githubProfileResp.status, resp)
)
// githubProfileResp.abort();// to abort the request


const doSimpleHttpBinPostResp = <ApiResponse>(
  DataStore.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
);
doSimpleHttpBinPostResp.result.then((resp) =>
  console.log(
    "DataStore.doSimpleHttpBinPost",
    doSimpleHttpBinPostResp.status,
    resp
  )
);


const doSimpleHttpBinGetResp = <ApiResponse>(
  DataStore.doSimpleHttpBinGet({ a: 1, b: 2, c: 3 })
);
doSimpleHttpBinGetResp.result.then((resp) =>
  console.log(
    "DataStore.doSimpleHttpBinGet",
    doSimpleHttpBinGetResp.status,
    resp
  )
);
```

### Notes
- For post method and post JSON body of `appplication/json`, the request will stringify and properly saves it into the body
- For get method and get JSON body will be transformed into query string and added to the url as `?a=1&b=2&c=3`

### How to contribute?
Create PR against master.

#### Note on release pipeline
```
npm version patch
version="$(cat package.json  | jq .version)"
git tag $version
git push origin $version
```
