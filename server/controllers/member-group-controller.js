'use strict';

import {Message, Group, User, MemberGroup, Op, Block, sequelize} from '../models';
import {responseHelper} from '../helpers/index'

export default class MemberGroupController {
    leaveGroup = async (req, res, next) => {
        try {
            const {groupId} = req.body;
            const userLoginId = req.user.id;
            const newMemberInGroup = await MemberGroup.destroy({
                    where: {
                        userId: userLoginId,
                        groupId
                    }
                });
            return responseHelper.responseSuccess(res, newMemberInGroup[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    clearConversation = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const {groupId} = req.body;
            const clearConversation = await MemberGroup.update(
                {
                    clearedAt: sequelize.fn('NOW')
                },
                {
                    where: {
                        groupId,
                        userId: userLoginId
                    },
                    returning: true
                });
            return responseHelper.responseSuccess(res, clearConversation[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}