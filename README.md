# restapi-typescript-decorators
Inpsired by [retrofit](https://github.com/square/retrofit) (created by Square), my goal for this project is to create a similar rest client using just decorators (also known as annotations in the Java's world). These decorators are used to make REST API calls simpler.

Another inspiration is to create a unified Rest Client library that works across the stack. In this case, to support node js and frontend code in a single code base. The goal is to create a single decorator for both node js and frontend.

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
- [X] Deploy to npm modules instead of using github
- [X] Support to instantiate multiple classes, useful when we need to support Api with different tokens.
- [X] Support for authorization (Bearer token at the monent)
- [X] Added Prettier for code format
- [ ] Support for other authorization types: Digest, Basic, etc...
- [ ] Add API retry actions
- [ ] Integrate with CI pipeline to build stuffs automatically

### How to use
You can also checkout the sample repo that has typescript and other things setup at https://github.com/synle/restapi-typescript-decorators-example

#### Install it
```
# install from npm
npm i --save restapi-typescript-decorators@^2.0.1

# install from github
npm install --save synle/restapi-typescript-decorators#2.0.1
```

Make sure you have the typescript and decorator enabled in your `tsconfig.json`

#### Simple Code Example
##### import the classes
```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse,
} from 'restapi-typescript-decorators';
```

##### Public (non authenticated) API Store
Below is an example on the definition for public API data store.
```
import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  CredentialProperty,
  ApiResponse,
} from "restapi-typescript-decorators";

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class PublicApiDataStore {
  @RestApi('/post', {
    method: 'POST',
  })
  doSimpleHttpBinPost(@RequestBody _body): any {}

  @RestApi('/get')
  doSimpleHttpBinGet(@QueryParams _queryParams): any {}

  @RestApi('/anything/{messageId}')
  doSimpleHttpBinPathParamsGet(
    @PathParam('messageId') _targetMessageId,
    @QueryParams _queryParams,
  ): any {}
}
```

Then instantiate it as
```
import { PublicApiDataStore } from './PublicApiDataStore';
const unAuthDataStoreInstance = new PublicApiDataStore();
```


##### Private (authenticated) API Store
Below is an example on the definition for private API data store.
```
import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  CredentialProperty,
  ApiResponse,
} from "restapi-typescript-decorators";

@RestClient({
  baseUrl: 'https://httpbin.org',
  authType: 'Bearer',
})
export class PrivateApiDataStore {
  @CredentialProperty
  accessToken: string;

  constructor(newAccessToken: string = '') {
    this.accessToken = newAccessToken;
  }

  @RestApi('/bearer', {
    method: 'GET',
  })
  doApiCallWithBearerToken(): any {}
}
```

Then instantiate it as
```
import { PrivateApiDataStore } from './PrivateApiDataStore';

const testAccessToken = '<<some_strong_and_random_access_token>>';
const myPrivateApiDataStoreInstance = new PrivateApiDataStore(testAccessToken);
```

###### To execute the RestClient
```
import { ApiResponse } from 'restapi-typescript-decorators';

const testAccessToken = '<<some_strong_and_random_access_token>>';
const myPrivateApiDataStoreInstance = new PrivateApiDataStore(testAccessToken);

const apiResponse = <ApiResponse>myPrivateApiDataStoreInstance.doApiCallWithBearerToken();

apiResponse.result.then((resp) => {
  // ... do something with your response and status code ...
  console.log("url", apiResponse.url);
  console.log('status', apiResponse.status)
  console.log('resp', resp)
});
```

###### To abort pending Rest calls
Sometimes you want to abort a pending Rest call.
```
// ... your construction code here ...

const apiResponse = <ApiResponse>myPrivateApiDataStore.doApiCallWithBearerToken();

apiResponse.result.then((resp) => {
  console.log('status', apiResponse.status)
  console.log('resp', resp)
});

apiResponse.abort()
```

##### Simple Get Rest Calls with Query String
```
@RestApi("/get")
doSimpleHttpBinGet(@QueryParams _queryParams): any {}
```

##### Simple Get Rest Calls with Path Param
```
@RestApi("/anything/{messageId}")
doSimpleHttpBinPathParamsGet(
  @PathParam("messageId") _targetMessageId
): any {}
```

##### Simple Get Rest Calls with Path Param and Query String
```
@RestApi("/anything/{messageId}")
doSimpleHttpBinPathParamsGet(
  @PathParam("messageId") _targetMessageId,
  @QueryParams _queryParams
): any {}
```

##### Simple Post Rest Calls
```
@RestApi("/post", {
  method: "POST",
})
doSimpleHttpBinPost(@RequestBody _body): any {}
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

npm publish
```
