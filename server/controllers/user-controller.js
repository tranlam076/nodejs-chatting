'use strict';

import {User, Op} from '../models';
import {encryptHelper} from '../helpers/index'
import {responseHelper} from '../helpers/index'

export default class UserController {

    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (username === '' || username === undefined) {
                return responseHelper.responseError(res, new Error('Username is required field'));
            } else if (password === null || password === '' || password === undefined) {
                return responseHelper.responseError(res, new Error('Password is required field'));
            } else {
                const user = await User.find({
                    where: {
                        username
                    }
                });
                if (!user) {
                    return responseHelper.responseError(res, new Error('Username not found'));
                } else {
                    let checkPassword = await encryptHelper.checkHash(password, user.password);
                    console.log(checkPassword);
                    if (checkPassword) {
                        return responseHelper.responseSuccess(res, true);
                    }
                    return responseHelper.responseError(res, new Error('Password is incorrect'));
                }
            }
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getListUser = async (req, res, next) => {
        try {
            const users = await User.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            return responseHelper.responseSuccess(res, users);
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }

    };

    createUser = async (req, res, next) => {
        try {
            const {username, password, address} = req.body;
            if (!Array.isArray(address) || address.length === 0) {
                return responseHelper.responseError(res, new Error('Address is invalid'));
            }
            let newHash = await encryptHelper.createHash(password);

            const newUser = await User.create({
                username,
                password: newHash,
                address
            });
            return responseHelper.responseSuccess(res, newUser);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }
    };

    getOneUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const user = await User.findById(id);
            if (!user) {
                return responseHelper.responseError(res, new Error('User not found'));
            }
            return responseHelper.responseSuccess(res, user);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    updateUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {username, address} = req.body;
            const updatedUser = await User.update(
                {
                    username,
                    address
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updatedUser[0] === 0) {
                return responseHelper.responseError(res, new Error('Cannot update user'));
            }
            return responseHelper.responseSuccess(res, updatedUser[1]);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            await User.destroy({
                where: {
                    id
                }
            });
            return responseHelper.responseSuccess(res, true);
        } catch (e) {
            console.log(e);
            return responseHelper.responseError(res, e);
        }
    };

    searchUser = async (req, res) => {
        try {
            const {username} = req.params;
            const user = await User.find({
                where: {
                    username: {
                        [Op.iLike]: '%' + username + '%'
                    }
                }
            });
            if (user !== null) {
                return responseHelper.responseSuccess(res, user.dataValues);
            } else {
                return responseHelper.responseError(res, new Error('User not found'));
            }
        } catch (e) {
            console.log(e);
            return responseHelper.responseError(res, e);
        }
    };

    changePassword = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {currentPassword, newPassword} = req.body;
            const user = await User.find({
                where: {
                    id
                }
            });
            let checkPassword = await encryptHelper.checkHash(currentPassword, user.password);
            if (checkPassword) {
                let newHash = await encryptHelper.createHash(newPassword);
                const updatedUser = await User.update(
                    {
                        password: newHash
                    },
                    {
                        where: {
                            id
                        },
                        returning: true
                    }
                );
                if (updatedUser[0] === 0) {
                    return responseHelper.responseError(res, new Error('Cannot update password'));
                }
                return responseHelper.responseSuccess(res, updatedUser[1]);
            }
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}