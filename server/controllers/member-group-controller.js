'use strict';

import {Message, Group, User, MemberGroup, Op, Block, sequelize} from '../models';
import {Response} from '../helpers/index'
import {memberGroupRepository, groupRepository} from '../repositories'

export default class MemberGroupController {
    leaveGroup = async (req, res, next) => {
        try {
            const groupId = req.params.id;
            const userLoginId = req.user.id;
            const isAuthorGroup = await groupRepository.getOne({
                where: {
                    id: groupId,
                    authorId: userLoginId
                },
                attributes: ['id', 'name']
            });

            if (isAuthorGroup) {
                await groupRepository.delete({
                    where: {
                        id: groupId
                    }
                });
                return Response.returnSuccess(res, true);
            }

            await memberGroupRepository.delete({
                where: {
                    userId: userLoginId,
                    groupId
                }
            });
            return Response.returnSuccess(res, true);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    inviteToGroup = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const groupId = req.params.id;
            const {invitedUserId} = req.body;

            const checkLoginMemberGroup = await memberGroupRepository.getOne({
                where: {
                    groupId,
                    userId: userLoginId
                },
                attributes: ['id']
            });

            if (checkLoginMemberGroup === null) {
                Response.returnError(res, new Error('User login was not in that group'))
            }

            const checkInviteMember = await memberGroupRepository.findOrCreate(
                {
                    where: {
                        groupId,
                        userId: invitedUserId,
                    },
                    paranoid: false,
                    defaults: {
                        groupId,
                        userId: invitedUserId
                    }
                }
            );

            if (checkInviteMember[1] === false) {
                await memberGroupRepository.update(
                    {
                        deletedAt: null
                    },
                    {
                        where: {
                            id: checkInviteMember[0].id
                        },
                        paranoid: false
                    }
                )
            }

            return Response.returnSuccess(res, true);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };
}