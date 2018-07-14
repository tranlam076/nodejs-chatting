'use strict';

import {Message, Group, User, Op} from '../models';
import {responseHelper} from '../helpers/index'

export default class MessageController {
    getListMessage = async (req, res, next) => {
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
            const {authorId, groupId, body, type} = req.body;
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
            const {authorId, groupId, body, type} = req.body;
            const updatedMessage = await Message.update(
                {
                    authorId,
                    groupId,
                    body,
                    type
                },
                {
                    where: {
                        id
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
            await Message.destroy({
                where: {
                    id
                }
            });
            return responseHelper.responseSuccess(res, true);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}