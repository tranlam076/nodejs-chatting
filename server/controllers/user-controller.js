'use strict';

import {User, Block, Op, sequelize, Group, MemberGroup} from '../models';
import {encryptHelper, Response, JWTHelper} from '../helpers/index'
import {userRepository} from '../repositories'

export default class UserController {
    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (username === '' || username === undefined) {
                return Response.returnError(res, new Error('Username is required field'));
            } else if (password === '' || password === undefined) {
                return Response.returnError(res, new Error('Password is required field'));
            } else {
                const user = await userRepository.getOne({
                    where: {
                        username
                    },
                    attributes: ['password', 'username', 'id', 'role']
                });
                if (!user) {
                    return Response.returnError(res, new Error('Username not found'));
                } else {
                    let checkPassword = await encryptHelper.checkHash(password, user.password);
                    console.log(checkPassword);
                    if (checkPassword) {
                        // Gen token
                        const token = await JWTHelper.sign({
                            id: user.id,
                            username: user.username,
                            role: user.role
                        });
                        return Response.returnSuccess(res, {
                            token
                        });
                    }
                    return Response.returnError(res, new Error('Password is incorrect'));
                }
            }
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    getListUsers = async (req, res, next) => {
        try {
            const users = await userRepository.getAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                attributes: ['id', 'username']
            });
            return Response.returnSuccess(res, users);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    createUser = async (req, res, next) => {
        try {
            const {username, password, address, role} = req.body;
            if (!Array.isArray(address) || address.length === 0) {
                return Response.returnError(res, new Error('Address is invalid'));
            }
            if (username === '' || username === undefined) {
                return Response.returnError(res, new Error('Username is required field'));
            } else if (password === '' || password === undefined) {
                return Response.returnError(res, new Error('Password is required field'));
            }
            let newHash = await encryptHelper.createHash(password);
            const newUser = await userRepository.create({
                username,
                password: newHash,
                address,
                role
            });
            return Response.returnSuccess(res, newUser);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    getOneUser = async (req, res, next) => {
        try {
            const id = req.user.id;
            const user = await User.findById(id);
            if (!user) {
                return Response.returnError(res, new Error('User not found'));
            }
            return Response.returnSuccess(res, user);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    updateUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {username, address} = req.body;
            const userLoginId = req.user.id;
            if (id !== userLoginId) {
                Response.returnError(res, 'User is not the author of that id')
            }
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
                return Response.returnError(res, new Error('Cannot update user'));
            }
            return Response.returnSuccess(res, updatedUser[1]);
        } catch (e) {
            return Response.returnError(res, new Error('User not found'));
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
            return Response.returnSuccess(res, true);
        } catch (e) {
            console.log(e);
            return Response.returnError(res, e);
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
                return Response.returnSuccess(res, user.dataValues);
            } else {
                return Response.returnError(res, new Error('User not found'));
            }
        } catch (e) {
            console.log(e);
            return Response.returnError(res, e);
        }
    };

    changePassword = async (req, res, next) => {
        try {
            const id = req.user.id;
            const {currentPassword, newPassword} = req.body;
            const user = await User.find({
                where: {
                    id
                },
                attributes: ['password']
            });
            console.log(user);
            if (!user) {
                return Response.returnError(res, new Error('User not found'));
            }
            const checkPassword = await encryptHelper.checkHash(currentPassword, user.password);
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
                    return Response.returnError(res, new Error('Cannot update password'));
                }
                return Response.returnSuccess(res, updatedUser[1]);
            }
            return Response.returnError(res, new Error('Password is incorrect'));
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    blockUserInGroup = async (req, res, next) => {
        try {
            const {userId, groupId} = req.params;
            const userLoginId = req.user.id;
            const group = await Group.find({
                where: {
                    authorId: userLoginId,
                    id: groupId
                }
            });
            if (group !== null) {
                const newBlock = await Block.create({
                    authorId: userLoginId,
                    userId,
                    groupId
                });
                return Response.returnSuccess(res, newBlock);
            }
            return Response.returnError(res, new Error('User is not the author of that group'))
        } catch (e) {
            return Response.returnError(res, e);
        }
    };
}