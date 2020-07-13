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
exports.RestApi = exports.RestClient = exports.CredentialProperty = exports.RequestBody = exports.QueryParams = exports.PathParam = void 0;
const get = require('lodash.get');
const set = require('lodash.set');
const objectAssign = require('lodash.assign');
const qs = require('qs');
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');
const _isOfTypeJson = (typeAsString) => (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;
const _defaultRequestTransform = (fetchOptionToUse, body, instance) => {
    let bodyToUse;
    switch (fetchOptionToUse.method) {
        case HttpVerb.GET:
            break;
        default:
            // POST, PUT, DELETE, etc...
            if (_isOfTypeJson(fetchOptionToUse.headers['Accept'])) {
                bodyToUse = JSON.stringify(body);
            }
            else {
                bodyToUse = body || null;
            }
            break;
    }
    return Promise.resolve(objectAssign(fetchOptionToUse, {
        body: bodyToUse,
    }));
};
const _defaultResponseTransform = (fetchOptionToUse, resp, instance) => {
    return resp.text().then((respText) => {
        if (_isOfTypeJson(fetchOptionToUse['headers']['Accept'])) {
            try {
                return JSON.parse(respText);
            }
            catch (e) {
                return respText;
            }
        }
        return respText;
    });
};
const _fetchData = (fetchOptions) => {
    const { url } = fetchOptions, restFetchOptions = __rest(fetchOptions, ["url"]);
    return nodeFetch(url, restFetchOptions);
};
const _getRequestBody = (instance, methodName, inputs) => inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];
const _getPathParams = (instance, methodName) => get(instance, ['__decorators', methodName, '@PathParam'], {});
const _getQueryParams = (instance, methodName, inputs) => inputs[get(instance, ['__decorators', methodName, '@QueryParams'])] || {};
const _getCredential = (instance) => {
    switch (instance.authType) {
        case AuthType.Bearer:
            return instance[get(instance, ['__decorators', '@CredentialProperty', 'AccessToken'])];
        case AuthType.Basic:
            const username = instance[get(instance, ['__decorators', '@CredentialProperty', 'Username'])];
            const password = instance[get(instance, ['__decorators', '@CredentialProperty', 'Password'])];
            // TODO: throws error here if no username or password...
            return _getBase64FromString(`${username}:${password}`);
    }
};
const _getBase64FromString = (str) => {
    try {
        // for node
        return Buffer.from(str).toString('base64');
    }
    catch (e) {
        // for browser
        return btoa(str);
    }
};
// enums
var AuthType;
(function (AuthType) {
    AuthType["Basic"] = "Basic";
    AuthType["Bearer"] = "Bearer";
    AuthType["Digest"] = "Digest";
})(AuthType || (AuthType = {}));
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["GET"] = "GET";
    HttpVerb["POST"] = "POST";
    HttpVerb["DELETE"] = "DELETE";
    HttpVerb["PUT"] = "PUT";
    HttpVerb["PATCH"] = "PATCH";
})(HttpVerb || (HttpVerb = {}));
// decorators
exports.PathParam = (paramKey) => (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@PathParam', paramKey], paramIdx);
};
exports.QueryParams = (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@QueryParams'], paramIdx);
};
exports.RequestBody = (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@RequestBody'], paramIdx);
};
exports.CredentialProperty = (credentialType) => (target, propertyName) => {
    set(target, ['__decorators', '@CredentialProperty', credentialType], propertyName);
};
exports.RestClient = (restOptions) => (target) => {
    const { baseUrl, authType } = restOptions, defaultConfigs = __rest(restOptions, ["baseUrl", "authType"]);
    const original = target;
    const f = function (...inputs) {
        return new original(...inputs);
    };
    f.prototype = original.prototype;
    const defaultConfigsToUse = objectAssign({
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {},
    }, defaultConfigs);
    defaultConfigsToUse.headers = objectAssign({
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }, defaultConfigsToUse.headers);
    f.prototype.defaultConfigs = defaultConfigsToUse;
    f.prototype.baseUrl = baseUrl;
    f.prototype.authType = authType || '';
    return f;
};
exports.RestApi = (url, restApiOptions = {}) => {
    return (target, methodName, descriptor) => {
        const { headers = {}, method = HttpVerb.GET, request_transform = _defaultRequestTransform, response_transform = _defaultResponseTransform } = restApiOptions, otherFetchOptions = __rest(restApiOptions, ["headers", "method", "request_transform", "response_transform"]);
        descriptor.value = function (...inputs) {
            const instance = this;
            const requestBody = _getRequestBody(instance, methodName, inputs);
            // construct the url wild cards {param1} {param2} etc...
            let urlToUse = '';
            const baseUrl = instance.baseUrl;
            urlToUse = `${baseUrl}${url}`;
            const pathParams = _getPathParams(instance, methodName);
            Object.keys(pathParams).forEach((paramKey) => {
                const paramIdx = pathParams[paramKey];
                const paramValue = inputs[paramIdx];
                urlToUse = urlToUse.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
            });
            // construct the query string if needed
            const queryParams = _getQueryParams(instance, methodName, inputs);
            if (Object.keys(queryParams).length > 0) {
                urlToUse += `?${qs.stringify(queryParams)}`;
            }
            // set up the headers
            const defaultConfigs = instance.defaultConfigs;
            const headersToUse = objectAssign({}, defaultConfigs.headers, headers);
            // add auth header if needed
            const authType = instance.authType;
            const credential = _getCredential(instance);
            if (authType && credential) {
                headersToUse['Authorization'] = `${authType} ${credential}`;
            }
            const controller = new AbortController();
            // doing the request transform
            const finalResp = {
                abort: () => {
                    controller.abort();
                },
            };
            finalResp.result = request_transform(objectAssign({
                url: urlToUse,
                method: method.toUpperCase(),
                signal: controller.signal,
                headers: headersToUse,
            }, otherFetchOptions), requestBody, instance).then((fetchOptionToUse) => {
                finalResp.request_body = fetchOptionToUse.body;
                finalResp.request_headers = fetchOptionToUse.headers;
                return _fetchData(fetchOptionToUse).then((resp) => {
                    finalResp.url = resp.url;
                    finalResp.ok = resp.ok;
                    finalResp.status = resp.status;
                    finalResp.statusText = resp.statusText;
                    finalResp.response_headers = resp.headers;
                    // doing the response transform
                    return response_transform(fetchOptionToUse, resp, instance);
                });
            });
            return finalResp;
        };
        return descriptor;
    };
};
