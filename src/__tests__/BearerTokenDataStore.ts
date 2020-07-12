import {
  RestClient,
  RestApi,
  AccessToken,
  RequestBody,
  PathParam,
  QueryParams,
  ApiResponse
} from "../index";

@RestClient({
  baseUrl: "https://httpbin.org"
})
export class BearerTokenDataStore {
  @AccessToken("bearer")
  setAccessToken(accessToken) {}

  @RestApi("/bearer", {
    method: "GET"
  })
  doApiCallWithBearerToken(): any {}
}
