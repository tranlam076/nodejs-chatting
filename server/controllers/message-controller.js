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
            const {groupId, body, type} = req.body;
            const authorId = req.user.id;
            const listBlocks = await Block.findAll({
                where: {
                    [Op.or]: [
                        {
                            groupId
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
                    if (block.userId !== null) {
                        listUserBlocks.push(block.userId);
                    }
                    if (block.authorId !== null) {
                        listUserBlocks.push(block.authorId);
                    }
                }
            }

            const isAlreadyBlocked = await MemberGroup.find({
                where: {
                    groupId,
                    userId: {
                        [Op.in]: listUserBlocks
                    }
                },
                attributes: (['id'])
            });

            if (isAlreadyBlocked !== null) {
                return responseHelper.responseError(res, new Error('User is already blocked'))
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