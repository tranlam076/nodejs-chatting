'use strict';

import {userController} from '../controllers/index';

module.exports = (app) => {

    app.route('/users')
        .get(userController.getListUser)
        .post(userController.createUser);

    app.route('/users/:id')
        .get(userController.getOneUser)
        .put(userController.updateUser)
        .delete(userController.deleteUser);

    app.route('/users/:id/changePassword')
        .post(userController.changePassword);

    app.route('/users/search/:username')
        .get(userController.searchUser);

    app.route('/users/login')
        .post(userController.login);
};
