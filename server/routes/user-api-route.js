'use strict';

import {userController} from '../controllers/index';
import {Authentication, RoleManagement} from '../middlewares'

module.exports = (app) => {

    app.route('/users')
        .get([Authentication.isAuth], userController.getListUsers)
        .post(userController.createUser);

    app.route('/users/:id')
        .get([Authentication.isAuth], userController.getOneUser)
        .put([Authentication.isAuth], userController.updateUser)
        .delete([Authentication.isAuth, RoleManagement.isAdmin], userController.deleteUser);

    app.route('/users/change-password')
        .post([Authentication.isAuth], userController.changePassword);

    app.route('/users/search/:username')
        .get([Authentication.isAuth], userController.searchUser);

    app.route('/login')
        .post(userController.login);

    app.route('/users/:userId/block/:groupId')
        .post([Authentication.isAuth], userController.blockUserInGroup);

};
