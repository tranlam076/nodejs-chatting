'use strict';

import {Group, User, MemberGroup, Message, Block, Op} from '../models';
import {responseHelper} from '../helpers/index'

export default class GroupController {
    getListGroups = async (req, res, next) => {
        try {
            const groups = await Group.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: User,
                    as: 'author'
                }]
                ,
                attributes: {
                    exclude: 'authorId'
                }
            });
            return responseHelper.responseSuccess(res, groups);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    createGroup = async (req, res, next) => {
        try {
            const {name, avatar, type} = req.body;
            const authorId = req.user.id;
            const newGroup = await Group.create({
                    name,
                    authorId,
                    avatar,
                    type,
                    members: {
                        userId: authorId,
                    }
                },
                {
                    include: [
                        {
                            model: MemberGroup,
                            as: 'members'
                        }
                    ]
                }
            );
            return responseHelper.responseSuccess(res, newGroup);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getOneGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const groupBlocks = await Block.findAll({
                where: {
                    groupId: id
                },
                attributes: ['userId']
            });
            let listUserBlocks = [];
            if (groupBlocks.length > 0) {
                for (let item of groupBlocks) {
                    listUserBlocks.push(item.userId)
                }
            }

            const group = await Group.find({
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        required: false,
                        model: MemberGroup,
                        as: 'members',
                        where: {
                            isLeave: false,
                            userId: {
                                [Op.notIn]: listUserBlocks
                            }
                        },
                        attributes: {
                            exclude: [
                                'authorId',
                                'groupId'
                            ]
                        },
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['username', 'avatar']
                            }
                        ]
                    }
                ],
                where: {
                    id
                },
                attributes: {
                    exclude: ['authorId']
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            if (!group) {
                return responseHelper.responseError(res, new Error('Group not found'));
            }
            return responseHelper.responseSuccess(res, group);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    updateGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {name, avatar, type} = req.body;
            const authorId = req.user.id;
            const updatedGroup = await Group.update(
                {
                    name,
                    avatar,
                    type
                },
                {
                    where: {
                        id,
                        authorId
                    },
                    returning: true
                }
            );
            if (updatedGroup[0] === 0) {
                return responseHelper.responseError(res, new Error('Cant update group'));
            }
            return responseHelper.responseSuccess(res, updatedGroup[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    deleteGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const authorId = req.user.id;
            const group = await Group.destroy({
                where: {
                    id,
                    authorId
                }
            });
            return responseHelper.responseSuccess(res, group >= 1);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getListMessages = async (req, res, next) => {
        try {
            const {id} = req.params;
            const authorId = req.user.id;
            const isLeaveGroup = await MemberGroup.find({
                where: {
                    groupId: id,
                    userId: authorId,
                    isLeave: false
                }, attributes: (['getMessageSince'])
            });

            if (isLeaveGroup === null) {
                return responseHelper.responseError(res, new Error('User is not in Group'))
            }

            const listBlocks = await Block.findAll({
                where: {
                    [Op.or]: [
                        {
                            groupId: id
                        },
                        {
                            authorId
                        }

                    ]
                },
                attributes: ['userId', 'authorId',]
            });
            let listUserBlocks = [];
            if (listBlocks.length > 0) {
                for (let block of listBlocks) {
                    if (block.userId === authorId) {
                        return responseHelper.responseError(res, new Error('User is already blocked'))
                    }
                    if (block.userId !== null) {
                        listUserBlocks.push(block.userId);
                    }
                    if (block.authorId !== null) {
                        listUserBlocks.push(block.authorId);
                    }
                }
            }

            const listMessages = await Message.findAll({
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: (['username'])
                        }
                    ],
                    where: {
                        groupId: id,
                        userId: {
                            [Op.notIn]: listUserBlocks
                        },
                        createdAt: {
                            [Op.gt]: isLeaveGroup.getMessageSince
                        }
                    },
                    attributes: {
                        exclude: [
                            'authorId',
                            'deletedAt',
                            'groupId',
                        ],
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }
            );
            return responseHelper.responseSuccess(res, listMessages);
        }
        catch
            (e) {
            return responseHelper.responseError(res, e);
        }
    }
    ;
}