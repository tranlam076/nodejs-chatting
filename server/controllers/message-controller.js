'use strict';

import {Message, Group, User, MemberGroup, Op, Block} from '../models';
import {responseHelper} from '../helpers/index'

export default class MessageController {
    getListMessages = async (req, res, next) => {
        try {
            const messages = await Message.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ],
                attributes: {
                    exclude: [
                        'authorId',
                        'groupId'
                    ],
                }
            });
            return responseHelper.responseSuccess(res, messages);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    createMessage = async (req, res, next) => {
        try {
            /*
            A group must be created before create a message, so we always have a group,
            which has info of users who we will create that message for.
            We have 3 kinds of block: -group block an user.
                                      -user block another user.
                                      -user block a group.
            */
            const {groupId, body, type} = req.body;
            const authorId = req.user.id;
            let block = null;
            const group = await Group.find({
                include: [
                    {
                        model: Block,
                        as: 'blocks',
                        attributes: (['id', 'userId', 'authorId']),
                    }
                ],
                attributes: (['type', 'authorId']),
                where: {
                   id: groupId
               }
            });

            if (group === null) {
                return responseHelper.responseError(res, new Error('Group do not exist'));
            }

            const isAMember= await MemberGroup.find({
                attributes: (['id']),
                where: {
                    groupId: groupId,
                    userId: authorId
                }
            });

            if (group.authorId !== authorId && isAMember === null) {
                return responseHelper.responseError(res, new Error('User was not in group'));
            }

            if (group.type === 'private' && group.blocks.length !== 0) {
                //check if user block another user or block a group
                for (block of group.blocks) {
                    if (block.authorId === authorId) {
                        return responseHelper.responseError(res, new Error('User already blocked'))
                    }
                }
            }
            if (group.type === 'group' && group.blocks.length !== 0) {
                //check if group block an user
                for (block of group.blocks) {
                    if (block.userId === authorId) {
                        return responseHelper.responseError(res, new Error('User already blocked'))
                    }
                }
            }
            const newMessage = await Message.create({
                authorId,
                groupId,
                body,
                type
            });
            return responseHelper.responseSuccess(res, newMessage);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getOneMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            const message = await Message.find({
                include: [
                     {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ],
                attributes: {
                    exclude: [
                        'authorId',
                        'groupId'
                    ],
                },
                where: {
                    id
                }
            });
            if (!message) {
                return responseHelper.responseError(res, new Error('Message not found'));
            }
            return responseHelper.responseSuccess(res, message);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    updateMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {groupId, body, type} = req.body;
            const authorId = req.user.id;
            const updatedMessage = await Message.update(
                {
                    groupId,
                    body,
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
            if (updatedMessage[0] === 0) {
                return responseHelper.responseError(res, new Error('Cant update Message'));
            }
            return responseHelper.responseSuccess(res, updatedMessage[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    deleteMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            const authorId = req.user.id;
            const message = await Message.destroy({
                where: {
                    id,
                    authorId
                }
            });
            return responseHelper.responseSuccess(res, message >= 1);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}