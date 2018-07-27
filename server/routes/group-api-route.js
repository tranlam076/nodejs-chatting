'use strict';

import {groupController} from '../controllers/index';
import {Authentication} from '../middlewares'

module.exports = (app) => {

    app.route('/groups')
        .get([Authentication.isAuth], groupController.getListGroups)
        .post([Authentication.isAuth], groupController.createGroup);

    app.route('/groups/:id')
        .get([Authentication.isAuth], groupController.getOneGroup)
        .put([Authentication.isAuth], groupController.updateGroup)
        .delete([Authentication.isAuth], groupController.deleteGroup);

    app.route('/groups/:id/get-list-messages')
        .post([Authentication.isAuth], groupController.getListMessages);
};
