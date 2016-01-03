'use strict';

const _ = require('lodash');
const superagent = require('superagent');
const Promise = require('native-promise-only');
const transform = require('../../common/transforms');
const enums = require('../../common/enums.api.js');

let csrfToken;
let user = 'nijk';

/**
 * Supply error name based on type i.e 4xx, 5xx
 * @param {number} errType
 * @returns {string} - error name
 */
function nameError( errType ) {
    if ( errType >= 4 ) {
        return parseInt( errType, 10 ) === 4 ? 'CLIENT_ERR' : 'SERVER_ERR';
    }
    return 'REQUEST_FAILED';
}

/**
 * Wrapper for making API requests
 * @param path
 * @param type
 * @param data
 */
const xhr = (path, type = 'get', data = {}, query = {}) => new Promise((resolve, reject) => {
    let request;
    switch (type) {
        case 'delete':
            request = superagent.del(path);
            break;
        case 'post':
            request = superagent.post(path, data);
            break;
        case 'put':
            request = superagent.put(path, data);
            break;
        default:
            request = superagent.get(path);
            break;
    }

    if (_.some(query)) {
        request.query(query);
    }

    if ('get' !== type && csrfToken) {
        request.set('X-CSRF-TOKEN', csrfToken);
    }

    request.set('Accept', 'application/json; charset=utf-8');
    request.end(( err, response ) => {
        if ( !err ) {
            response.body = JSON.parse( response.text );
            resolve( response );
        } else {
            reject({
                name: nameError( err.response && err.response.statusType ),
                err: err,
                response: err.response
            });
        }
    });
});

/**
 * Ensure POST/PUT requests fetch a CSRF token first if none exists
 * @param done
 * @returns Promise
 */
const preflightPOST = (done) => {
    if (!csrfToken) {
        return new Promise((resolve, reject) => {
            API.fetchCSRFToken().then(() => done(resolve, reject), reject);
        });
    }

    return new Promise(done);
};

const API = {
    fetchCSRFToken () {
        return xhr(enums.routes.auth.token)
            .then(({ body }) => {
                csrfToken = body.token;
                return csrfToken;
            })
            .catch((e) => {
                console.warn('XHR: fetchCSRFToken error', e);
            });
    },
    fetchProduct (url, done) {
        const path = transform.route(enums.routes.product, { url: encodeURIComponent(url) });
        return xhr(path, 'get')
            .then((response) => {
                console.info('XHR: fetchProduct', url, response);
                done(response);
            })
            .catch((e) => console.warn('XHR: fetchProduct error', e));
    },
    addProduct (product, collection) {
        const path = transform.route(enums.routes.collection, { resource: 'wishlists', collection });
        const addProduct = (resolve, reject) => {
            xhr(path, 'post', { user, item: product })
                .then(resolve)
                .catch((e) => {
                    console.warn('XHR: addProduct error', e);
                    reject(e);
                });
        };
        return preflightPOST(addProduct);
    },
    updateProduct (product, collection) {
        const path = transform.route(enums.routes.collection, { resource: 'wishlists', collection });
        const updateProduct = (resolve, reject) => {
            xhr(path, 'put', { user, item: product })
                .then(resolve)
                .catch((e) => {
                    console.warn('XHR: updateProduct error', e);
                    reject(e);
                });
        };
        return preflightPOST(updateProduct);
    },
    deleteProduct (product, collection) {
        const path = transform.route(enums.routes.collection, {
            resource: 'wishlists',
            collection,
            id: product._id
        });

        return new Promise((resolve, reject) => xhr(path, 'delete', { user, item: product })
                .then(resolve)
                .catch((e) => {
                    console.warn('XHR: deleteProduct error', e);
                    reject(e);
                })
        );
    },
    fetchCollection ({ resource, collection, page, limit }) {
        const path = transform.route(enums.routes.collection, { resource, collection });
        return new Promise((resolve, reject) => xhr(path, 'get', null, { page, limit })
            .then(resolve, reject)
            .catch((e) => {
                console.warn('XHR: fetchCollection error', e);
                reject(e);
            })
        );
    },
    userLogin ({ email, password }) {
        const path = enums.routes.auth.login;
        const userLogin = (resolve, reject) => {
            xhr(path, 'post', { email, password })
                .then((response) => {
                    console.info('XHR: userLogin', url, response);
                    done(response);
                })
                .catch((e) => console.warn('XHR: userLogin error', e));
        };
        return preflightPOST(userLogin);
    }
};

module.exports = API;
