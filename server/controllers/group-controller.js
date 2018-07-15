'use strict';

import {Group, User, Op, Message} from '../models';
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
                type
            });
            return responseHelper.responseSuccess(res, newGroup);
        } catch (e) {
            return responseHelper.responseError(res, e);
        }
    };

    getOneGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const group = await Group.find({
                include: {
                    model: User,
                    as: 'author'
                },
                attributes: {
                    exclude: 'authorId'
                },
                where: {
                    id
                }
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
}