# restapi-typescript-decorators
This decorator is used to make REST api calls simpler. The goal is to create a single decorator for both node js and front end.

### TODO's
- [X] Supports abort
- [X] Supports proper serialization of request based on headers accept
- [X] Allows custom serialization for request
- [X] Allows custom deserialization for response
- [X] Support for path params
- [X] Support for query string
- [ ] Throw exception when missing key params
- [X] Add a new class decorator and supports default custom properties and baseUrl at a class / repo level
- [X] Document usages for the new Decorators
- [ ] Document steps for custom serialization and deserialization
- [ ] Deploy to npm modules instead of using github
- [ ] Integrate with CI pipeline to build stuffs automatically

### How to use
#### Install it
```
npm install --save synle/restapi-typescript-decorators#1.0.3
```

Make sure you have the typescript and decorator enabled in your `tsconfig.json`

#### Simple Code Example
##### RestApi Store
```
import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse,
} from "restapi-typescript-decorators";

@RestClient({
  baseUrl: "https://httpbin.org",
})
class HttpBinDataStore {
  @RestApi("/post", {
    method: "POST",
  })
  static doSimpleHttpBinPost(@RequestBody _body): any {}

  @RestApi("/get")
  static doSimpleHttpBinGet(@QueryParams _queryParams): any {}

  @RestApi("/anything/{messageId}")
  static doSimpleHttpBinPathParamsGet(
    @PathParam("messageId") _targetMessageId,
    @QueryParams _queryParams
  ): any {}
}
```

###### To execute the RestClient
```
const doSimpleHttpBinPostResp = <ApiResponse>(
  HttpBinDataStore.doSimpleHttpBinPost({ a: 1, b: 2, c: 3 })
);
doSimpleHttpBinPostResp.result.then((resp) =>
  console.log(
    "HttpBinDataStore.doSimpleHttpBinPost",
    doSimpleHttpBinPostResp.status,
    resp
  )
);
```

###### To abort pending Rest calls
Sometimes you want to abort a pending Rest call.
```
doSimpleHttpBinPostResp.abort()
```

##### Simple Get Rest Calls with Query String
```
...
@RestApi("/get")
static doSimpleHttpBinGet(@QueryParams _queryParams): any {}
...
```

##### Simple Get Rest Calls with Path Param
```
...
@RestApi("/anything/{messageId}")
static doSimpleHttpBinPathParamsGet(
  @PathParam("messageId") _targetMessageId
): any {}
...
```

##### Simple Get Rest Calls with Path Param and Query String
```
...
@RestApi("/anything/{messageId}")
static doSimpleHttpBinPathParamsGet(
  @PathParam("messageId") _targetMessageId,
  @QueryParams _queryParams
): any {}
...
```

##### Simple Post Rest Calls
```
...
@RestApi("/post", {
  method: "POST",
})
static doSimpleHttpBinPost(@RequestBody _body): any {}
...
```


#### Notes
- For post method and post JSON body of `appplication/json`, the request will stringify and properly saves it into the body


### How to contribute?
Create PR against master.

#### Note on release pipeline
```
npm run build
npm version patch
version="$(cat package.json  | jq .version)"
git tag $version
git push origin $version
```
