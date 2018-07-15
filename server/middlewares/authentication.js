'use strict';
import {JWTHelper, responseHelper} from '../helpers'

export default class Authentication {

    static isAuth = async (req, res, next) => {
        try {
            let token = null;
            if (req.query.token !== undefined) {
                token = req.query.token;
            } else if (req.headers.authorization !== undefined) {
                token = req.headers.authorization;
            } else if (req.body.token !== undefined) {
                token = req.body.token;
            }
            if (token !== null && token.includes('Bearer')) {
                const tokens = token.split('Bearer ');
                if (tokens.length === 2) {
                    token = token.split('Bearer ')[1]
                }
            }
            if (token === null) {
                return responseHelper.responseError(res, new Error('Token is not provided'));
            }
            req.user = await JWTHelper.verify(token, 'node_mentor_secret_key');
            return next();
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    }

}