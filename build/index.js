"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestApi = exports.RestClient = exports.RequestBody = exports.QueryParams = exports.PathParam = void 0;
const get = require("lodash.get");
const set = require("lodash.set");
const qs = require("qs");
const nodeFetch = require("node-fetch");
const AbortController = require("abort-controller");
const _isOfTypeJson = typeAsString => (typeAsString || "").toLowerCase().indexOf("application/json") >= 0;
const _defaultRequestTransform = (fetchOptionToUse, body) => {
    let bodyToUse;
    switch (fetchOptionToUse.method) {
        case "GET":
            break;
        default:
            // POST, PUT, DELETE, etc...
            if (_isOfTypeJson(fetchOptionToUse.headers["Accept"])) {
                bodyToUse = JSON.stringify(body);
            }
            else {
                bodyToUse = body || null;
            }
            break;
    }
    fetchOptionToUse.body = bodyToUse;
};
const _defaultResponseTransform = (fetchOptionToUse, resp) => {
    if (_isOfTypeJson(fetchOptionToUse["headers"]["Accept"])) {
        return resp.json();
    }
    return resp.text();
};
exports.PathParam = paramKey => (target, methodName, paramIdx) => {
    set(target, ["__decorators", methodName, "@PathParam", paramKey], paramIdx);
};
exports.QueryParams = (target, methodName, paramIdx) => {
    set(target, ["__decorators", methodName, "@QueryParams"], paramIdx);
};
exports.RequestBody = (target, methodName, paramIdx) => {
    set(target, ["__decorators", methodName, "@RequestBody"], paramIdx);
};
const fetchData = fetchOptions => {
    const { url } = fetchOptions, restFetchOptions = __rest(fetchOptions, ["url"]);
    return nodeFetch(url, restFetchOptions);
};
exports.RestClient = (_a) => {
    var { baseUrl } = _a, defaultConfigs = __rest(_a, ["baseUrl"]);
    return (constructor) => {
        constructor.prototype.baseUrl = baseUrl || "";
        const defaultConfigsToUse = Object.assign({ mode: "cors", cache: "no-cache", credentials: "include", headers: {} }, defaultConfigs);
        defaultConfigsToUse.headers = Object.assign({ Accept: "application/json", "Content-Type": "application/json" }, defaultConfigsToUse.headers);
        constructor.prototype.defaultConfigs = defaultConfigsToUse;
    };
};
exports.RestApi = (url, _a = {}) => {
    var { headers = {}, method = "GET", request_transform = _defaultRequestTransform, response_transform = _defaultResponseTransform } = _a, otherFetchOptions = __rest(_a, ["headers", "method", "request_transform", "response_transform"]);
    return (target, methodName, descriptor) => {
        descriptor.value = (...inputs) => {
            method = method.toUpperCase();
            const requestBody = inputs[get(target, ["__decorators", methodName, "@RequestBody"])];
            // construct the url wild cards {param1} {param2} etc...
            url = `${target.prototype.baseUrl}${url}`;
            const pathParams = get(target, ["__decorators", methodName, "@PathParam"], {});
            Object.keys(pathParams).forEach(paramKey => {
                const paramIdx = pathParams[paramKey];
                const paramValue = inputs[paramIdx];
                url = url.replace(new RegExp(`{${paramKey}}`, "g"), paramValue);
            });
            // construct the query string if needed
            const queryParams = inputs[get(target, ["__decorators", methodName, "@QueryParams"])];
            url += `?${qs.stringify(queryParams)}`;
            const headersToUse = Object.assign(Object.assign({}, target.prototype.defaultConfigs.headers), headers);
            const controller = new AbortController();
            const fetchOptionToUse = Object.assign(Object.assign({}, otherFetchOptions), { url, method: method, signal: controller.signal, headers: headersToUse, body: null });
            // doing the request transform
            request_transform(fetchOptionToUse, requestBody);
            const finalResp = {
                request_body: fetchOptionToUse.body,
                request_headers: fetchOptionToUse.headers,
                abort: () => {
                    controller.abort();
                } // used to abort the api
            };
            finalResp.result = fetchData(fetchOptionToUse).then(resp => {
                finalResp.status = resp.status;
                finalResp.response_headers = resp.headers;
                // doing the response transform
                return response_transform(fetchOptionToUse, resp);
            });
            return finalResp;
        };
        return descriptor;
    };
};
//# sourceMappingURL=index.js.map