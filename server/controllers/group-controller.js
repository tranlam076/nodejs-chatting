'use strict';

import {Group, User, MemberGroup, Message, Block, Op, sequelize} from '../models';
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
            const userLoginId = req.user.id;
            const newGroup = await Group.create({
                    name,
                    authorId: userLoginId,
                    avatar,
                    type,
                    members: {
                        userId: userLoginId,
                        clearedAt: sequelize.fn('NOW')
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
            const userLoginId = req.user.id;
            const updatedGroup = await Group.update(
                {
                    name,
                    avatar,
                    type
                },
                {
                    where: {
                        id,
                        authorId: userLoginId
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
            const userLoginId = req.user.id;
            const group = await Group.destroy({
                where: {
                    id,
                    authorId: userLoginId
                }
            });
            return responseHelper.responseSuccess(res, group >= 1);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getListActiveGroups = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const memberGroups = await MemberGroup.findAll({
                where: {
                    userId: userLoginId
                },
                attributes: ['groupId']
            });
            const groups = memberGroups.map((item) => item.groupId);
            const listActiveGroups = await Group.findAll({
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['username', 'avatar']
                    }
                ],
                where: {
                    id: groups
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

    inviteToJoinGroup = async (req, res, next) => {
        try {
            const {userId} = req.body;
            const groupId = req.params.id;
            const userLoginId = req.user.id;

            console.log(groupId);
            console.log(userLoginId);
            console.log(userId);

            const isMembers = await MemberGroup.find({
                where: {
                    userId: userLoginId,
                    groupId
                },
                attributes: ['id']
            });
            if (isMembers === null) {
                return responseHelper.responseError(res, new Error('UserLogin was not in that Group'))
            }

            const memberGroups = await MemberGroup.find({
                where: {
                    groupId,
                    userId: userId
                },
                attributes: (['id'])
            });
            if (memberGroups !== null) {
                return responseHelper.responseError(res, new Error('User had been in that Group'))
            }

            const newMemberGroup = await MemberGroup.create({
                userId,
                groupId,
                clearedAt: sequelize.fn('NOW')
            });
            return responseHelper.responseSuccess(res, newMemberGroup);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}