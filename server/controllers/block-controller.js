'use strict';

import {Block, Group, User, Op} from '../models';
import {responseHelper} from '../helpers/index'

export default class BlockController {
    getListBlock = async (req, res, next) => {
        try {
            const blocks = await Block.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: User,
                        as: 'user'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ],
                attributes: {
                    exclude: [
                        'authorId',
                        'userId',
                        'groupId'
                    ],
                }
            });
            return responseHelper.responseSuccess(res, blocks);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    createBlock = async (req, res, next) => {
        try {
            const {userId, groupId} = req.body;
            const authorId = req.user.id;
            const newBlock = await Block.create({
                authorId,
                userId,
                groupId
            });
            return responseHelper.responseSuccess(res, newBlock);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getOneBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            const block = await Block.find({
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: User,
                        as: 'user'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ],
                attributes: {
                    exclude: [
                        'authorId',
                        'authorId',
                        'groupId'
                    ],
                },
                where: {
                    id
                }
            });
            if (!block) {
                return responseHelper.responseError(res, new Error('Block not found'));
            }
            return responseHelper.responseSuccess(res, Block);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    updateBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {authorId, userId, groupId} = req.body;
            const author = req.user.id;
            const block = await Block.find({
                where: {
                    id
                },
                attributes: ['authorId']
            });
            if (author !== block.authorId) {
                return responseHelper.responseError(res, new Error('User is not the author of block'));
            }
            const updatedBlock = await Block.update(
                {
                    authorId,
                    userId,
                    groupId
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updatedBlock[0] === 0) {
                return responseHelper.responseError(res, new Error('Cant update Block'));
            }
            return responseHelper.responseSuccess(res, updatedBlock[1]);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    deleteBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            const authorId = req.user.id;
            const block = await Block.find({
                where: {
                    id
                },
                attributes: ['authorId']
            });
            if (authorId !== block.authorId) {
                return responseHelper.responseError(res, new Error('User is not the author of group'));
            }
            await Block.destroy({
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