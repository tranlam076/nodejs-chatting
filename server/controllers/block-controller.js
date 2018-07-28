'use strict';

import {Block, Group, User, Op} from '../models';
import {responseHelper} from '../helpers/index'

export default class BlockController {
    getListBlocks = async (req, res, next) => {
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
            const {authorId, userId, groupId} = req.body;
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
            const {userId, groupId} = req.body;
            const authorId = req.user.id;
            const updatedBlock = await Block.update(
                {
                    userId,
                    groupId
                },
                {
                    where: {
                        id,
                        authorId
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
            const block = await Block.destroy({
                where: {
                    id,
                    authorId
                }
            });
            return responseHelper.responseSuccess(res, block >= 1);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };
}