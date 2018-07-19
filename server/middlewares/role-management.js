'use strict';
import {RoleVerify, responseHelper} from '../helpers'

export default class RoleManagement {
    static isAdmin = async (req, res, next) => {
        try {
                const role =  await RoleVerify.getRole(req.user.id);
                if (role === 'admin') {
                    return next();
                } else {
                    return responseHelper.responseError(res, new Error('User is not an admin'));
                }
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    }
}