'use strict';
import {JWTHelper, Response} from '../helpers'

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
                req.user = await JWTHelper.verify(token);
            } else if (authorization) {
                const tokens = authorization.split('Bearer ');
                if (tokens.length !== 2) {
                    return Response.returnError(res, new Error('token is not provided'))
                }
                req.user = await JWTHelper.verify(tokens[1]);
            } else {
                return Response.returnError(res, new Error('token is not provided'))
            }
            return next();
        } catch (e) {
            return Response.returnError(res, e);
        }
    }

}