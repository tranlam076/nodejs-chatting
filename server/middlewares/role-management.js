'use strict';
import {responseHelper} from '../helpers'

export default class RoleManagement {
    static isAdmin = async (req, res, next) => {
        try {
                if (req.user.role === 'admin') {
                    return next();
                } else {
                    return responseHelper.responseError(res, new Error('User is not an admin'));
                }
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    }
}