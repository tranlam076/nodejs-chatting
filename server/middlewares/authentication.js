'use strict';
import {JWTHelper, responseHelper} from '../helpers'

export default class Authentication {

    static isAuth = async (req, res, next) => {
        try {
            let token = null;
            let authorization = null;
            if (req.query.token !== undefined) {
                token = req.query.token;
            } else if (req.headers.authorization !== undefined) {
                authorization = req.headers.authorization;
            } else if (req.body.token !== undefined) {
                authorization = req.body.token;
            }
            if (token !== null) {
                req.user = await JWTHelper.verify(token, 'node_mentor_secret_key');
            } else if (authorization) {
                const tokens = authorization.split('Bearer ');
                if (tokens.length !== 2) {
                    return responseHelper.responseError(res, new Error('token is not provided'))
                }
                req.user = await JWTHelper.verify(tokens[1], 'node_mentor_secret_key');
            } else {
                return responseHelper.responseError(res, new Error('token is not provided'))
            }
            return next();
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    }

}