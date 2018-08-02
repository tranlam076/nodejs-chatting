'use strict';
import {Response} from '../helpers'

export default class RoleManagement {
    static isAdmin = async (req, res, next) => {
        try {
                if (req.user.role === 'admin') {
                    return next();
                } else {
                    return Response.returnError(res, new Error('User is not an admin'));
                }
        } catch (e) {
            return Response.returnError(res, e);
        }
    }
}