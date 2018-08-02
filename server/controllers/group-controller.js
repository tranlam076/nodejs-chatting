'use strict';

import {Group, User, MemberGroup, Message, Block, Op, sequelize} from '../models';
import {Response} from '../helpers/index';
import {memberGroupRepository, groupRepository} from '../repositories';


export default class GroupController {
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
            const group = await groupRepository.getOne({
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
                return Response.returnError(res, new Error('Group not found'));
            }
            return Response.returnSuccess(res, group);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    updateGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {name, avatar, type} = req.body;
            const userLoginId = req.user.id;
            const updatedGroup = await groupRepository.update(
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
            return Response.returnSuccess(res, updatedGroup[1]);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    deleteGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const userLoginId = req.user.id;
            const group = await groupRepository.delete({
                where: {
                    id,
                    authorId: userLoginId
                }
            });
            return Response.returnSuccess(res, group >= 1);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    getListActiveGroups = async (req, res, next) => {
        try {
            const memberGroups = await memberGroupRepository.getAll({
                where: {
                    userId: req.user.id
                },
                attributes: ['groupId']
            });
            const groupIds = memberGroups.map(item => item.groupId);
            const groups = await groupRepository.getAll(
                    {
                        where: {
                            id: groupIds
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }
                );
            return Response.returnSuccess(res, groups);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    createGroup = async (req, res, next) => {
        let newGroup = null;
        try {
            const userLoginId = req.user.id;
            const {name, type, memberIds, partnerId} = req.body;
            let memberGroupIds = [];
            switch (type) {
                case 'private':
                    if (partnerId === undefined) {
                        return Response.returnError(res, new Error('partnerId is required field'));
                    }
                    const existingGroup = await groupRepository.getOne({
                        where: {
                            [Op.or]: [
                                {
                                    authorId: userLoginId,
                                    partnerId: partnerId
                                },
                                {
                                    partnerId: userLoginId,
                                    authorId: partnerId
                                }
                            ]
                        }
                    });
                    if (existingGroup) {
                        return Response.returnSuccess(res, existingGroup);
                    }
                    memberGroupIds = [userLoginId, partnerId];
                    break;
                case 'group':
                    if (name === undefined) {
                        return Response.returnError(res, new Error('Name group is required field'));
                    }
                    if (memberIds === undefined || !Array.isArray(memberIds) || memberIds.length === 0) {
                        return Response.returnError(res, new Error('Member group is invalid'));
                    }
                    if (!memberIds.includes(userLoginId)) {
                        memberIds[memberIds.length] = userLoginId;
                    }
                    memberGroupIds = memberIds;
                    break;
                default:
                    return Response.returnError(res, new Error('Invalid type group'));
            }
            newGroup = await Group.create({
                name,
                authorId: userLoginId,
                type,
                partnerId
            });

            const memberGroups = memberGroupIds.map(item => {
                return {
                    userId: item,
                    groupId: newGroup.id
                }
            });
            const createMemberGroups = await memberGroupRepository.bulkCreate(memberGroups);
            if (createMemberGroups.length === 0) {
                return Response.returnError(res, new Error('Can not create MemberGroup'));
            }
            return Response.returnSuccess(res, newGroup);
        } catch (e) {
            if (newGroup) {
                Group.destroy({
                    force: true,
                    where: {
                        id: newGroup.id
                    }
                });
            }
            return Response.returnError(res, e);
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

            const isMembers = await memberGroupRepository.getOne({
                where: {
                    userId: userLoginId,
                    groupId
                },
                attributes: ['id']
            });
            if (isMembers === null) {
                return Response.returnError(res, new Error('UserLogin was not in that Group'))
            }

            const memberGroups = await memberGroupRepository.getOne({
                where: {
                    groupId,
                    userId: userId
                },
                attributes: (['id'])
            });
            if (memberGroups !== null) {
                return Response.returnError(res, new Error('User had been in that Group'))
            }

            const newMemberGroup = await memberGroupRepository.create({
                userId,
                groupId,
                clearedAt: sequelize.fn('NOW')
            });
            return Response.returnSuccess(res, newMemberGroup);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };
}