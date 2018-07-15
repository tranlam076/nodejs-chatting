'use strict';
import JWT from 'jsonwebtoken';

export default class JWTHelper {

    static async sign (privateKey, data) {
        return new Promise((resolve, reject) => {
            JWT.sign(data, privateKey, {
                expiresIn: 60 * 60
            }, (err, token) => {
                if (err) {
                    return reject(err);
                }
                return resolve(token);
            });
        });
    }

    static async verify (token, privateKey) {
        return new Promise((resolve, reject) => {
            JWT.verify(token, privateKey, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

}