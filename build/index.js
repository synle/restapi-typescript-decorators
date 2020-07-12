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
exports.RestApi = exports.CredentialProperty = exports.RestClient = exports.RequestBody = exports.QueryParams = exports.PathParam = void 0;
const get = require('lodash.get');
const set = require('lodash.set');
const qs = require('qs');
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');
const _isOfTypeJson = (typeAsString) => (typeAsString || '').toLowerCase().indexOf('application/json') >= 0;
const _defaultRequestTransform = (fetchOptionToUse, body) => {
    let bodyToUse;
    switch (fetchOptionToUse.method) {
        case 'GET':
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
    fetchOptionToUse.body = bodyToUse;
};
const _defaultResponseTransform = (fetchOptionToUse, resp) => {
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
const _objectAssign = Object.assign;
const _getRequestBody = (instance, methodName, inputs) => inputs[get(instance, ['__decorators', methodName, '@RequestBody'])];
const _getPathParams = (instance, methodName) => get(instance, ['__decorators', methodName, '@PathParam'], {});
const _getQueryParams = (instance, methodName, inputs) => inputs[get(instance, ['__decorators', methodName, '@QueryParams'])] || {};
const _getCredential = (instance) => instance[get(instance, ['__decorators', '@CredentialProperty'])];
exports.PathParam = (paramKey) => (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@PathParam', paramKey], paramIdx);
};
exports.QueryParams = (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@QueryParams'], paramIdx);
};
exports.RequestBody = (target, methodName, paramIdx) => {
    set(target, ['__decorators', methodName, '@RequestBody'], paramIdx);
};
exports.RestClient = (restOptions) => (target) => {
    const { baseUrl, authType } = restOptions, defaultConfigs = __rest(restOptions, ["baseUrl", "authType"]);
    const original = target;
    const f = function (...inputs) {
        return new original(...inputs);
    };
    f.prototype = original.prototype;
    const defaultConfigsToUse = _objectAssign({
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {},
    }, defaultConfigs);
    defaultConfigsToUse.headers = _objectAssign({
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }, defaultConfigsToUse.headers);
    f.prototype.defaultConfigs = defaultConfigsToUse;
    f.prototype.baseUrl = baseUrl;
    f.prototype.authType = authType || '';
    return f;
};
exports.CredentialProperty = (target, propertyName) => {
    set(target, ['__decorators', '@CredentialProperty'], propertyName);
};
exports.RestApi = (url, _a = {}) => {
    var { headers = {}, method = 'GET', request_transform = _defaultRequestTransform, response_transform = _defaultResponseTransform } = _a, otherFetchOptions = __rest(_a, ["headers", "method", "request_transform", "response_transform"]);
    return (target, methodName, descriptor) => {
        descriptor.value = function (...inputs) {
            const instance = this;
            method = method.toUpperCase();
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
            const headersToUse = Object.assign(Object.assign({}, defaultConfigs.headers), headers);
            // add auth header if needed
            const authType = instance.authType;
            const credential = _getCredential(instance);
            if (authType && credential) {
                headersToUse['Authorization'] = `${authType} ${credential}`;
            }
            const controller = new AbortController();
            const fetchOptionToUse = Object.assign(Object.assign({}, otherFetchOptions), { url: urlToUse, method: method, signal: controller.signal, headers: headersToUse, body: null });
            // doing the request transform
            request_transform(fetchOptionToUse, requestBody);
            const finalResp = {
                url: urlToUse,
                request_body: fetchOptionToUse.body,
                request_headers: fetchOptionToUse.headers,
                abort: () => {
                    controller.abort();
                },
            };
            finalResp.result = _fetchData(fetchOptionToUse).then((resp) => {
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
