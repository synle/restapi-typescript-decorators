![CI Job status](https://github.com/synle/restapi-typescript-decorators/workflows/Package%20and%20Publish%20to%20NPM/badge.svg)
[![NPM Version](https://badge.fury.io/js/restapi-typescript-decorators.svg)](https://badge.fury.io/js/restapi-typescript-decorators)

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
- [X] Document steps for custom serialization (`request_transform`) and deserialization(`response_transform`)
- [X] Deploy to npm modules instead of using github
- [X] Support to instantiate multiple classes, useful when we need to support Api with different tokens.
- [X] Support for authorization (Bearer token at the monent)
- [X] Added Prettier for code format
- [X] Support for basic authorization with username and passwords
- [X] Clean up the types and use proper types from node-fetch instead of using our own
- [X] Allow calling instance methods within `request_transform` and `response_transform`
- [ ] Add API retry actions
- [ ] Add API debounce actions
- [X] Integrate with CI pipeline to build stuffs and run tests automatically
- [X] Make CI pipeline publish to npm registry

### How to use
You can also checkout the sample repo that has typescript and other things setup at https://github.com/synle/restapi-typescript-decorators-example

#### Install it
install from npm
```
npm i --save restapi-typescript-decorators@^2
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


##### Private (authenticated with Bearer Token) API Store
Below is an example on the definition for private API data store.
```
import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  CredentialProperty,
} from "restapi-typescript-decorators";

@RestClient({
  baseUrl: 'https://httpbin.org',
  authType: 'Bearer',
})
export class PrivateBearerAuthApiDataStore {
  @CredentialProperty('AccessToken')
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
import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';
const myPrivateBearerAuthApiDataStoreInstance = new PrivateBearerAuthApiDataStore('<<some_strong_and_random_access_token>>');
```



##### Private (authenticated with username and password basic auth) API Store
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

@RestClient({
  baseUrl: 'https://httpbin.org',
  authType: 'Basic',
})
export class PrivateBasicAuthApiDataStore {
  @CredentialProperty('Username')
  username: string;

  @CredentialProperty('Password')
  password: string;

  constructor(newUsername: string = '', newPassword: string = '') {
    this.username = newUsername;
    this.password = newPassword;
  }

  @RestApi('/basic-auth/good_username/good_password', {
    method: 'GET',
  })
  doApiCallWithBasicUsernameAndPassword(): any {}
}
```

Then instantiate it as
```
import { PrivateApiDataStore } from './PrivateApiDataStore';
const myPrivateBasicAuthApiDataStoreInstance = new PrivateBasicAuthApiDataStore('good_username', 'good_password');
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
Sometimes you want to abort a pending Rest call. You can use `apiResponse.abort()`
```
// ... your construction code here ...

const apiResponse = <ApiResponse>myPrivateApiDataStore.doApiCallWithBearerToken();

apiResponse.result.then((resp) => {
  // ... api will be aborted, and this section will not be executed ...
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
  @PathParam("messageId") _targetMessageId: string
): any {}
```

##### Simple Get Rest Calls with Path Param and Query String
```
@RestApi("/anything/{messageId}")
doSimpleHttpBinPathParamsGet(
  @PathParam("messageId") _targetMessageId : string,
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


#### Transformations
You can use `request_transform` and `response_transform` to do transformation on the request and response API

##### Simple request transform
This example will transform the request before sending the request to the backend. The example will do some translation to the input data before sending the data to the backend.


```
import { RestClient, RestApi, RequestBody, PathParam, QueryParams } from 'restapi-typescript-decorators';

interface NumberPair {
  a: number;
  b: number;
}

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TransformationApiDataStore {
  @RestApi('/anything', {
    method: 'POST',
    request_transform: (fetchOptions: Request, pair: NumberPair, instance: TransformationApiDataStore): Promise<Request> => {
      const newBody = {
        a: pair.a * 100,
        b: pair.b * 200,
      };

      return Promise.resolve(
        Object.assign(fetchOptions, {
          body: JSON.stringify(newBody),
        }),
      );
    },
  })
  doSimpleRequestTransformApi(@RequestBody requestBody: NumberPair): any {}
}

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();
const apiResponse = <ApiResponse>(
  myTransformationApiDataStoreInstance.doSimpleRequestTransformApi({ a: 1, b: 2 })
);

//... follow the above example to get the data from result promise
```



##### Simple response transform
This example will transform the response before returning the final result to the front end. The example code will add the response values and return the sum as the response


```
import { RestClient, RestApi, RequestBody, PathParam, QueryParams } from 'restapi-typescript-decorators';

interface NumberPair {
  a: number;
  b: number;
}

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TransformationApiDataStore {
  @RestApi('/anything', {
    method: 'POST',
    response_transform: (fetchOptions: Request, resp: Response, instance: TransformationApiDataStore): Promise<any> => {
      return resp.json().then((respJson) => {
        const pair = <NumberPair>JSON.parse(respJson.data);
        const sum = pair.a + pair.b;

        return { sum };
      });
    },
  })
  doSimpleResponseTransformApi(@RequestBody requestBody: NumberPair): any {}
}

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();
const apiResponse = <ApiResponse>(
  myTransformationApiDataStoreInstance.doSimpleResponseTransformApi({ a: 300, b: 700 })
);

//... follow the above example to get the data from result promise
```

#### Notes
- For post method and post JSON body of `appplication/json`, the request will stringify and properly saves it into the body


### How to contribute?
Create PR against master.

#### Note on release pipeline
To publish directly to npm
```
npm version patch && \
git push origin master
```
