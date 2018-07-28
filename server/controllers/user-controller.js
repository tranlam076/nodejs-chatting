'use strict';

import {User, Block, Op, sequelize, Group, MemberGroup} from '../models';
import {encryptHelper, responseHelper, JWTHelper} from '../helpers/index'

export default class UserController {

    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (username === '' || username === undefined) {
                return responseHelper.responseError(res, new Error('Username is required field'));
            } else if (password === '' || password === undefined) {
                return responseHelper.responseError(res, new Error('Password is required field'));
            } else {
                const user = await User.find({
                    where: {
                        username
                    },
                    attributes: ['password', 'username', 'id', 'role']
                });
                if (!user) {
                    return responseHelper.responseError(res, new Error('Username not found'));
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
                        return responseHelper.responseSuccess(res, {
                            token
                        });
                    }
                    return responseHelper.responseError(res, new Error('Password is incorrect'));
                }
            }
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getListUsers = async (req, res, next) => {
        try {
            const users = await User.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: Block,
                        as: 'blocks',
                        include: [
                            {
                                model: User,
                                as: 'user'
                            },
                            {
                                model: Group,
                                as: 'group'
                            },
                        ],
                        attributes: {
                            exclude: [
                                'authorId',
                                'userId',
                                'groupId'
                            ],
                        },
                        required: false
                    },
                    {
                        model: Group,
                        as: 'groups',
                        required: false
                    }
                ]
            });
            return responseHelper.responseSuccess(res, users);
        } catch (e) {
            console.log(e);
            return responseHelper.responseError(res, e);
        }
    };

    createUser = async (req, res, next) => {
        try {
            const {username, password, address, role} = req.body;
            if (!Array.isArray(address) || address.length === 0) {
                return responseHelper.responseError(res, new Error('Address is invalid'));
            }
            if (username === '' || username === undefined) {
                return responseHelper.responseError(res, new Error('Username is required field'));
            } else if (password === '' || password === undefined) {
                return responseHelper.responseError(res, new Error('Password is required field'));
            }
            let newHash = await encryptHelper.createHash(password);
            const newUser = await User.create({
                username,
                password: newHash,
                address,
                role
            });
            return responseHelper.responseSuccess(res, newUser);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getOneUser = async (req, res, next) => {
        try {
            const id = req.user.id;
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
            const authorId = req.user.id;
            if (id !== authorId) {
                responseHelper.responseError(res, 'User is not the author of that id')
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
                return responseHelper.responseError(res, new Error('Cannot update user'));
            }
            return responseHelper.responseSuccess(res, updatedUser[1]);
        } catch (e) {
            return responseHelper.responseError(res, new Error('User not found'));
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
                return responseHelper.responseError(res, new Error('User not found'));
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
                    return responseHelper.responseError(res, new Error('Cannot update password'));
                }
                return responseHelper.responseSuccess(res, updatedUser[1]);
            }
            return responseHelper.responseError(res, new Error('Password is incorrect'));
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    blockUserInGroup = async (req, res, next) => {
        try {
            const {userId, groupId} = req.params;
            const authorId = req.user.id;
            const group = await Group.find({
                where: {
                    authorId,
                    id: groupId
                }
            });
            if (group !== null) {
                const newBlock = await Block.create({
                    authorId,
                    userId,
                    groupId
                });
                return responseHelper.responseSuccess(res, newBlock);
            }
            return responseHelper.responseError(res, new Error('User is not the author of that group'))
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };


    joinGroup = async (req, res, next) => {
        try {
            const {groupId} = req.body;
            const userId = req.user.id;
            const group = await Group.find({
               where: {
                   id: groupId
               },
                attributes: (['createdAt'])
            });
            if (group === null) {
                return responseHelper.responseError(res, new Error('group dose not exist'))
            }
            const newMemberInGroup = await MemberGroup.create(
                {
                    userId,
                    groupId,
                    getMessageSince: group.createdAt
                });
            return responseHelper.responseSuccess(res, newMemberInGroup);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    leaveGroup = async (req, res, next) => {
        try {
            const {groupId} = req.body;
            const userId = req.user.id;
            const newMemberInGroup = await MemberGroup.update(
                {
                    isLeave: true,
                },
                {
                where: {
                    userId,
                    groupId
                }
            });
            return responseHelper.responseSuccess(res, newMemberInGroup);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getListActiveGroups = async (req, res, next) => {
        try {
            const authorId = req.user.id;
            const userBlocks = await Block.findAll({
                where: {
                    authorId
                },
                attributes: ['groupId']
            });
            let listGroupBlocks = [];
            if (userBlocks.length > 0) {
                for (let item of userBlocks) {
                    listGroupBlocks.push(item.groupId)
                }
            }

            const listActiveGroups = await Group.findAll({
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        required: true,
                        model: MemberGroup,
                        as: 'members',
                        where: {
                            userId: authorId,
                            isLeave: false,
                        },
                        attributes: []
                    },
                ],
                where: {
                    id: {
                        [Op.notIn]: listGroupBlocks
                    }
                },
                attributes: {
                    exclude: ['authorId', 'updatedAt', 'createdAt', 'deletedAt']
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            });
            return responseHelper.responseSuccess(res, listActiveGroups);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    clearConversation = async (req, res, next) => {
        try {
            const authorId = req.user.id;
            const {groupId} = req.body;
            const clearConversation = await MemberGroup.update(
                {
                    getMessageSince: sequelize.fn("NOW")
                },
                {
                    where: {
                        groupId,
                        userId: authorId
                    },
                    returning: true
                });
            if (clearConversation[0] === 0) {
                return responseHelper.responseError(res, new Error('Cant clear conversation'));
            }
            return responseHelper.responseSuccess(res, clearConversation[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}