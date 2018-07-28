'use strict';
let bcrypt = require('bcrypt');
const saltRounds = 5;
let salt = bcrypt.genSaltSync(saltRounds);

export default class EncryptionHelper {
    createHash = (text) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(text, salt, function (err, hash) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            });
        })
    };

    checkHash = (text, hash) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(text, hash, function (err, res) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(res);
                }
            });
        });
    };
}
