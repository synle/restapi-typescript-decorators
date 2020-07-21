![CI Job status](https://github.com/synle/restapi-typescript-decorators/workflows/Package%20and%20Publish%20to%20NPM/badge.svg)
[![NPM Version](https://badge.fury.io/js/restapi-typescript-decorators.svg)](https://badge.fury.io/js/restapi-typescript-decorators)

# restapi-typescript-decorators
Inpsired by [retrofit](https://github.com/square/retrofit) (created by Square), my goal for this project is to create a similar rest client using just decorators (also known as annotations in the Java's world). These decorators are used to make REST API calls simpler.

Another inspiration is to create a unified Rest Client library that works across the stack. In this case, to support node js and frontend code in a single code base. The goal is to create a single decorator for both node js and frontend.

### Features
- [X] Supports for path params. `@PathParam` can be used in a class member or a method parameter. See usages for `@PathParam`. Refer to [Using @PathParams Section](#simple-get-rest-calls-with-path-param) for more details.
- [X] Supports for query string. See usages for `@QueryParams`. Refer to [Using @QueryParams Section](#simple-get-rest-calls-with-query-string) for more details.
- [X] Supports for POSTING JSON requests. See usages for `@RequestBody`. Refer to [Using @RequestBody Section](#simple-post-rest-calls-with-json-body) for more details.
- [X] Supports POST raw data to API with `@FormDataBody`. Refer to [Using @FormData Section](#simple-post-rest-calls-with-formdata-body) for more details.
- [X] Supports File Upload. See usages for `@FileUploadBody`. Refer to [Using @FileUploadBody Section](#simple-post-rest-calls-with-file-upload-as-stream) for more details.
- [X] Supports JSON Parser for Request with `Content-Type=application/json`.  Refer to [Parse JSON Request](#parse-json-request) for more details.
- [X] Supports URL Encoded Form Parser for POST Request with `Content-Type=application/x-www-form-urlencoded`.  Refer to [Parse URL Encoded Form Request](#parse-url-encoded-form-request) for more details.
- [X] Supports XML Parser for Response with `Accept=application/xml`. refer to [parse XML response section](#parse-response-as-xml) for more information.
- [X] Supports JSON Parser for Response with `Accept=application/json`. refer to [parse JSON response section](#parse-response-as-json) for more information.
- [X] Supports for basic authorization with username and passwords. Refer to [Private Basic Auth API Section](#private-authenticated-with-username-and-password-basic-auth-api-store).
- [X] Supports for authorization (Bearer token at the monent). Refer to [Private Bearer API Section](#private-authenticated-with-bearer-token-api-store).
- [X] Supports custom serialization (`requestTransform`) and deserialization(`responseTransform`). Refer to [Transformation Section](#transformations) for more details
- [X] Supports Serialization of Response Object into custom type. Refer to [Type Casting Section](#type-casting-your-response-type) for more details
- [X] Supports for API retry config. Currently only support a fixed delay after before retry. [Max timeout for request section](#api-retries)
- [X] Supports for API timeout config, refer to [setting max timeout for request section](#max-timeout-for-api) for more information
- [X] Supports abort pending API requests.  Refer to [Aborting Pending Requests](#to-abort-pending-rest-calls) for more details
- [X] Supports overrides for headers, and rest config from the `@RestClient` and `@RestApi`. Refer to [Config Overrides](#config-overrides) for more details

### TODO's
- [X] Supports proper serialization of request based on headers accept
- [X] Add a new class decorator and supports default custom properties and baseUrl at a class / repo level
- [X] Deploy to npm modules instead of using github
- [X] Supports to instantiate multiple classes, useful when we need to support Api with different tokens.
- [X] Allow calling instance methods within `requestTransform` and `responseTransform`
- [X] Added Prettier for code format
- [X] Clean up the types and use proper types from node-fetch instead of using our own
- [X] Integrate with CI pipeline to build stuffs and run tests automatically
- [X] Make CI pipeline publish to npm registry
- [X] Uses `ApiResponse` for return type instead of `any`
- [X] Consolidate enum / string types for `HttpVerb` and `AuthType`
- [X] Allows class level `@RestClient` override for `requesgt_transform` and `responseTransform`
- [X] Support POST binary file to API
- [X] Have an example repo for backend NodeJS code. Refer to the demos at [frontend example repo](https://github.com/synle/restapi-typescript-decorators-front-end-example) or [backend node js example repo](https://github.com/synle/restapi-typescript-decorators-back-end-example)
- [X] Have an example repo for frontend code. Refer to the front end example repo
- [X] Cleanup / Refactor and Export typescript types
- [X] Enforce `noImplicitAny`
- [ ] Throw exception when missing key params
- [X] Make sure the retry logics respect Server side `retry-after` response header.
- [ ] Add support for custom retry, aka has it more dynamic as a custom function...
- [ ] Add API debounce actions
- [X] Add support for custom `fast-xml-parser` options


### How to use
You can also checkout the sample repos that has typescript and other things setup:
- [frontend with React sample code repo](https://github.com/synle/restapi-typescript-decorators-front-end-example)
- [backend NodeJs sample code repo](https://github.com/synle/restapi-typescript-decorators-back-end-example)

#### Install it
install from npm
```
npm i --save restapi-typescript-decorators@^6
```

Make sure you have the typescript and decorator enabled in your `tsconfig.json`

#### Simple Code Example
Most of these examples return `ApiResponse<any>` for simplicity. You can use the library to cast the response object in a custom format. Refer to the bottom section of this guide for how to do type cast your requests and responses.

#### import the classes
```
import {
  ApiResponse,
  CredentialProperty,
  FileUploadBody,
  FormDataBody,
  PathParam,
  QueryParams,
  RequestBody,
  RestApi,
  RestClient,
} from 'restapi-typescript-decorators';
```

#### Public (non authenticated) API Store
Below is an example on the definition for public API data store.
```
import {
  RestClient,
  RestApi,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  FileUploadBody,
  ApiResponse,
} from 'restapi-typescript-decorators';


// first define your request and response body
export interface HttpBinRequest {
  [propName: string]: any;
}
export interface HttpBinResponse {
  args?: {
    [propName: string]: any;
  };
  headers?: {
    [propName: string]: any;
  };
  origin?: string;
  url?: string;
  data?: {
    [propName: string]: any;
  };
  json?:
    | string
    | {
        [propName: string]: any;
      };
  form?: {
    [propName: string]: any;
  };
  [propName: string]: any;
}

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class PublicApiDataStore {
  // do simple get with query params
  @RestApi('/get')
  doGetWithQueryParams(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple get with absolute URL
  // this example will use url defined here
  // instead of appended it to the baseUrl
  @RestApi('https://httpbin.org/get')
  doGetWithAbsoluteUrl(): ApiResponse<HttpBinResponse> {}

  // do simple get with path params
  @RestApi('/anything/{messageId}')
  doGetWithPathParamsAndQueryParams(
    @PathParam('messageId') _targetMessageId: string,
    @QueryParams _queryParams: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // the actual API will return in 10 seconds, but the client
  // will fail and timeout in 3 seconds
  @RestApi('/delay/10', {
    timeout: 3000,
  })
  doGetWithTimeout(): ApiResponse<HttpBinResponse> {}

  // this API will always return 405 error
  @RestApi('/status/405')
  doErroneousAPI(): ApiResponse<HttpBinResponse> {}

  @RestApi('/{encodingToUse}')
  doGetWithResponseEncoding(
    @PathParam('encodingToUse') _encoding: 'brotli' | 'gzip' | 'deflate',
  ): ApiResponse<HttpBinResponse> {}

  @RestApi('/xml', {
    headers: {
      Accept: 'application/xml',
    },
  })
  doGetWithXmlResponse(): ApiResponse<HttpBinResponse> {}

  // do simple post with JSON request body
  @RestApi('/post', {
    method: 'POST',
  })
  doPostWithJsonBody(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}

  // do simple post with URL encoded form request body
  @RestApi('/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  doPostWithEncodedFormData(
    @RequestBody _body: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // do simple post with formData
  @RestApi('/anything', {
    method: 'POST',
  })
  doPostWithFormBodyData(
    @FormDataBody('unitPrice') _unitPrice: number,
    @FormDataBody('quantity') _qty: number,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file via input named `mySms`
  @RestApi('/anything', {
    method: 'POST',
  })
  doUploadFileWithFormBodyData(
    @FormDataBody('mySms') _mySmsContent: HttpBinRequest,
  ): ApiResponse<HttpBinResponse> {}

  // this example uploads the file as a single stream
  @RestApi('/post', {
    method: 'POST',
  })
  doUploadFileWithStreamRequest(
    @FileUploadBody _fileToUpload: any,
  ): ApiResponse<HttpBinResponse> {}
}
```

**Then instantiate it as**
```
import { PublicApiDataStore } from './PublicApiDataStore';
const myApiInstance = new PublicApiDataStore();
```

**Use it**
```
apiResponse = myApiInstance.doGetWithQueryParams({a: 1, b: 2});
if(apiResponse){
  apiResponse.result.then(
    resp => {
      // do something with your response
    }
  );
}
```


#### Private (authenticated with Bearer Token) API Store
Below is an example on the definition for private API data store.
```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';


// first define your request and response body
export interface HttpBinAuthResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
  [propName: string]: any;
}

// Rest Client
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
  doAuthenticatedCall(): ApiResponse<HttpBinAuthResponse> {}
}
```

**Then instantiate it as**
```
import { PrivateBearerAuthApiDataStore } from './PrivateBearerAuthApiDataStore';
const myApiInstance = new PrivateBearerAuthApiDataStore(
  'good_username',
  'good_password'
);

// ... refer to other section for how to execute the calls
```



#### Private (authenticated with username and password basic auth) API Store
```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';


// first define your request and response body
export interface HttpBinAuthResponse {
  authenticated: boolean;
  user?: string;
  token?: string;
  [propName: string]: any;
}

// Rest Client
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
  doAuthenticatedCall(): ApiResponse<HttpBinAuthResponse> {}
}
```

**Then instantiate it as**
```
import { PrivateBasicAuthApiDataStore } from './PrivateBasicAuthApiDataStore';
const myApiInstance = new PrivateBasicAuthApiDataStore(
  'good_username',
  'good_password'
);

// ... refer to other section for how to execute the calls
```


#### To execute the RestClient
```
const myApiInstance = new PrivateApiDataStore('<<some_strong_and_random_access_token>>');

const apiResponse = myApiInstance.doApiCallWithBearerToken();

if(apiResponse){
  apiResponse.result.then((resp) => {
    // ... do something with your response and status code ...
    console.log('ok', apiResponse.ok);
    console.log("url", apiResponse.url);
    console.log('status', apiResponse.status);
    console.log('resp', resp);
  });
}
```

#### To abort pending Rest calls
Sometimes you want to abort a pending Rest call. You can use `apiResponse.abort()`. Note that this action will also disable any attempt to retry the API for any pending instance method invokation. Say you are calling a fetch user with 5 retries, if you do `abort`. At that moment in time, the API will stop the pending API call and any retry.

```
// ... your construction code here ...

const apiResponse = myApiInstance.doApiCallWithBearerToken();

if(apiResponse){
  apiResponse.result.then((resp) => {
    // ... api will be aborted, and this section will not be executed ...
  });

  apiResponse.abort()
}
```

#### Simple GET REST Calls with Query String
This will send a GET request to the backend with query string attached. The library will handle url encoding for your data. So no need to encode it when using this API.
```
@RestApi('/get')
doGetWithQueryParams(@QueryParams _queryParams: HttpBinRequest): ApiResponse<HttpBinResponse> {}
```

#### Simple GET REST Calls with Path Param
@PathParams can be used in a class members (class attributes) or method parameters.

Below is an example of how path params can be used in a class member
```
@RestApi("/anything/{messageId}")
doGetWithPathParams(
  @PathParam("messageId") _targetMessageId: string
): ApiResponse<any> {}
```

The following code shows how path params can be used in class members and method parameters
```
@RestClient({
  baseUrl: 'https://httpbin.org/cookies/set/{cookieName}/{cookieValue}',
})
export class PathParamApiDataStore {
  @PathParam('cookieName')
  cookieName: string;

  constructor(newCookieName: string = '') {
    this.cookieName = newCookieName;
  }

  @RestApi()
  doGet(@PathParam('cookieValue') _newCookieValue: string): ApiResponse<HttpBinResponse> {}
}
```

#### Simple GET REST Calls with Path Param and Query String
```
@RestApi('/anything/{messageId}')
doGetWithPathParamsAndQueryParams(
  @PathParam('messageId') _targetMessageId: string,
  @QueryParams _queryParams: HttpBinRequest,
): ApiResponse<HttpBinResponse> {}
```

#### Simple POST Rest Calls with JSON Body
```
@RestApi('/post', {
  method: 'POST',
})
doPostWithJsonBody(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}
```


#### Simple POST Rest Calls with FormData Body
```
@RestApi('/anything', {
  method: 'POST',
})
doPostWithFormBodyData(
  @FormDataBody('unitPrice') _unitPrice: number,
  @FormDataBody('quantity') _qty: number,
): ApiResponse<HttpBinResponse> {}
```


#### Simple POST Rest Calls with File Upload as Stream
This example uploads the file as a single stream

```
@RestApi('/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
doSimpleUploadFileWithStreamHttpBinPost(
  @FileUploadBody _fileToUpload: any,
): ApiResponse<HttpBinResponse> {}
```

This expects your response to be a buffer. Below is how you can craft the buffer for Node Js
```
import fs from 'fs';
const sampleSmsFileStream = fs.createReadStream('SampleSms.txt');
const apiResponse = myPublicDataStoreInstance.doSimpleUploadFileWithStreamHttpBinPost(
  sampleSmsFileStream,
);
```

#### URL Notes
By default, the library will construct the url to use as:

- When `@RestApi.url` is a relative url (for example "`/myAPI`"). The url by appended the `url` from `@RestApi` to `baseUrl` from `@RestClient` as:
```
urlToUse = @RestClient.baseUrl + @RestApi.url
```

- When `@RestApi.url` is an absolute url which starts with `http://` or `https://` (for example "`https://httpbin.org/get`" or "`http://httpbin.org/get`"). That absolute url will be used and won't be appended to the `baseUrl`
```
urlToUse = @RestApi.url
```

#### Type casting your response type
Sometimes it might be useful to cast / parsing the json object in the response to match certain object type. We can do so with this library using this approach.

**Then RestClient class will look something like this**
```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  FileUploadBody,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

// First define a custom interface
// interface for request
interface NumberPair {
  a: number;
  b: number;
}

// interface for response
interface CollectionSum {
  sum: number;
}

@RestClient({
  baseUrl: 'https://httpbin.org',
})
export class TypeCastApiDataStore {
  @RestApi('/calculateSum', {
    method: 'POST',
  })
  doPostWithTypeCasting(@RequestBody requestBody: NumberPair): ApiResponse<CollectionSum> {}
}
```

#### Max timeout for API
You can set a max timeout using the `timeout` attribute. In which the API will be aborted if the timeout has passed.

In this example, the actual API will return in 10 seconds, but the client will timeout and abort the request in 3 seconds
```
@RestApi('/delay/10', {
  timeout: 3000,
})
doSimpleTimeoutAPI(): ApiResponse<HttpBinResponse> {}
```

#### API Retries
For cases when API can fail due to some QPS (Query Per Second) requirements and the vendor wants the user to attempt a retry at a later time, you can set the parameter for retryConfigs which allows the API to be retried. This way the API will be called again until the totalRetry has passed. To use this, simply set the `retryConfigs` under the `@RestApi`  decorator.

This example below will retry if there's failure in the response. It will wait a second before attempting a new retry.

As for checking how many retries has been attempted to reach the API. You can refer to the `retryCount` property of the `ApiResponse`.

Note:
- That when the user attempted to abort the API calls manually using the `abort()` method from `ApiResponse`, this action will stop the API from further retries.
- Another note is that the client will respect server `Retry-After` response header. And will attempt to retry after that delay. At the moment we only support `Retry-After` that is of number of seconds to invoke an API retry
```
@RestClient({
  baseUrl: 'http://localhost:8080',
})
export class RetryDataStore {
  @RestApi('/hello', {
    retryConfigs: {
      count: 5, // maximum retry 5 times
      delay: 1000, // retry after 1 second
    },
  })
  doApiWithRetry(): ApiResponse<HttpBinResponse> {}
}
```


#### Understanding the ApiResponse.result Promise
It's the promise that wrapped around the fetch calls. At the moment, the API will return the resolved promise state when the API is successful, and rejected state if the call is aborted by the user or it's an API network error.


#### Request and Response Format
By default, the library will help parsing of the response when you set the proper value for `Accept` Header.

To use the default parser, you can set the Accept Header. This example below will tell the library to parse the response as if the response is a XML. The default behavior is to parse response as JSON.


##### Parse JSON Request
The default header value for `Content-Type` is `application/json`. You can also be explicit about it. But basically it will transform your JSON request object into JSON string understood by the backend that consumes JSON.
```
@RestApi('/post', {
  method: 'POST',
  // the following header value is implied
  //  headers: {
  //    'Content-Type': 'application/xml',
  //  },
})
doSimpleHttpBinPostJsonBody(@RequestBody _body: HttpBinRequest): ApiResponse<HttpBinResponse> {}
```


##### Parse URL Encoded Form Request
The default header value for `Content-Type` is `application/x-www-form-urlencoded`. When this is provided, the library will send your request in url encoded form format.
```
@RestApi('/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})
doSimpleHttpBinPostEncodedForm(
  @RequestBody _body: HttpBinRequest,
): ApiResponse<HttpBinResponse> {}
```



##### Parse Response as XML
This will parse the XML response and return them as JSON object
```
@RestApi('/xml', {
// the following header value is implied
//  headers: {
//    'Accept': 'application/xml',
//  },
})
doSimpleHttpGetWithXmlData(): ApiResponse<HttpBinResponse> {}
```

##### Parse Response as JSON
The default header value for `Accept` is `application/json`. You can also be explicit about it. But basically it will transform your response into JSON objects.
```
@RestApi('/json', {
  headers: {
    'Accept': 'application/json',
  },
})
doSimpleJSONGet(): ApiResponse<HttpBinResponse> {}
```


You can also provide `fast-xml-parser` custom configurations for the client using `@RestClient` property `xmlParseOptions` at the class level.
```

@RestClient({
  baseUrl: 'https://httpbin.org',
  xmlParseOptions: {
    attrPrefix : "@_",
    textNodeName : "#text",
    ignoreNonTextNodeAttr : true,
    ignoreTextNodeAttr : true,
    ignoreNameSpace : true
  }
})
export class TransformationApiDataStore {
  @RestApi('/xml', {
    method: 'POST',
    headers: {
      'Accept': 'application/xml',
    },
  })
  doSimpleRequestTransformApi(@RequestBody requestBody: NumberPair): ApiResponse<any> {}
}
```

#### Transformations
You can use `requestTransform` and `responseTransform` to do transformation on the request and response API. You can define the transformation at both the `@RestClient` or `@RestApi` level. When both are defined, a more specific tranformation at `@RestApi` will be used toward the final transformation.

#### Simple request transform
This example will transform the request before sending the request to the backend. The example will do some translation to the input data before sending the data to the backend.


```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  FileUploadBody,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

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
    requestTransform: (fetchOptions: Request, pair: NumberPair, instance: TransformationApiDataStore): Promise<Request> => {
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
  doSimpleRequestTransformApi(@RequestBody requestBody: NumberPair): ApiResponse<any> {}
}

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();
const apiResponse = myTransformationApiDataStoreInstance.doSimpleRequestTransformApi({ a: 1, b: 2 })

if(apiResponse){
  //... follow the above example to get the data from result promise
}
```



#### Simple response transform
This example will transform the response before returning the final result to the front end. The example code will add the response values and return the sum as the response


```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  FileUploadBody,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

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
    responseTransform: (fetchOptions: Request, resp: Response, instance: TransformationApiDataStore): Promise<any> => {
      return resp.json().then((respJson) => {
        const pair = <NumberPair>JSON.parse(respJson.data);
        const sum = pair.a + pair.b;

        return Promise.resolve({ sum });
      });
    },
  })
  doSimpleResponseTransformApi(@RequestBody requestBody: NumberPair): ApiResponse<any> {}
}

const myTransformationApiDataStoreInstance = new TransformationApiDataStore();
const apiResponse = myTransformationApiDataStoreInstance.doSimpleResponseTransformApi({ a: 300, b: 700 })

if(apiResponse){
  //... follow the above example to get the data from result promise
}
```


#### Config Overrides
We have 3 layers of configs: `DefaultConfig` (default configs from this library), `@RestClient` Custom Configs and `@RestApi` Custom Configs. The final config values are set using this order `DefaultConfig`, `@RestClient`, and `@RestApi`.

#### Config Override Table
| `DefaultConfigs` | `@RestClient` | `@RestApi` | `Config To Use` |
|------------------|---------------|------------|-----------------|
| a                | b             | c          | c               |
| a                | b             |            | b               |
| a                |               | c          | c               |
|                  | b             | c          | c               |
| a                |               |            | a               |
|                  | b             |            | b               |
|                  |               | c          | c               |

#### Config Override Example
Below is an example on how to set Custom Config
```
import {
  RestClient,
  RestApi,
  CredentialProperty,
  RequestBody,
  PathParam,
  FileUploadBody,
  QueryParams,
  FormDataBody,
  ApiResponse,
} from 'restapi-typescript-decorators';

import { HttpBinResponse } from './types';

@RestClient({
  baseUrl: 'https://httpbin.org',
  headers: {
    'Accept-Encoding': 'ASCII',
    '--Rest-Client-Custom-Header': '<some_value_@Restclient_111>',
    '--Rest-Api-Custom-Header': '<this_value_will_overrided>',
  },
})
export class OverrideConfigApiDataStore {
  @RestApi('/anything', {
    method: 'POST',
    mode: 'no-cors',
    cache: 'reload',
    credentials: 'same-origin',
    headers: {
      'Accept-Encoding': 'UTF8',
      'Content-Type': '<some_value_@RestApi_333>',
      '--Rest-Api-Custom-Header': '<some_value_@RestApi_222>',
    },
  })
  doSimplePostWithCustomRestApiConfig(): ApiResponse<HttpBinResponse> {}
}
```

With the above example
- `--Rest-Api-Custom-Header`: will be `<some_value_@RestApi_222>` because it's set in @RestApi which has more specificity even though its value in `@RestClient` is `<this_value_will_overrided>`
- `--Rest-Client-Custom-Header`: will be `<some_value_@Restclient_111>` because it's set inside of `@RestApi` although it's not defined anywhere else in `DefaultConfigs` or `@RestClient`
- `Content-Type`: will be `application/json` because it's set in the `DefaultConfigs` even though we didn't specify it.



#### Notes
- For POST method and POST JSON body of `appplication/json`, the request will stringify and properly saves it into the body
- Note that when both `@RequestBody` and `@FormDataBody` are used, `@FormDataBody` will have higher precendence

### How to contribute?
Make the change and create PR against master.

### Issues?
If you have any issue with the API, feel free to file a bug on Github at https://github.com/synle/restapi-typescript-decorators/issues/new

#### Note on release pipeline
To publish directly to npm

##### Beta Tags
```
npm run build && \
npm version prepatch && \
npm publish --tag beta
```

##### Prod Tags
```
npm run build && \
npm version patch && \
git push origin master
```
