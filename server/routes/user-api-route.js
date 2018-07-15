'use strict';

import {userController} from '../controllers/index';
import {Authentication} from '../middlewares'

module.exports = (app) => {

    app.route('/users')
        .get(userController.getListUsers)
        .post([Authentication.isAuth], userController.createUser);

    app.route('/users/:id')
        .get([Authentication.isAuth], userController.getOneUser)
        .put([Authentication.isAuth], userController.updateUser)
        .delete([Authentication.isAuth], userController.deleteUser);

    app.route('/users/changePassword')
        .post([Authentication.isAuth], userController.changePassword);

    app.route('/users/search/:username')
        .get([Authentication.isAuth], userController.searchUser);

    app.route('/users/login')
        .post(userController.login);
};
