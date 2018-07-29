'use strict';

import {memberGroupController} from '../controllers/index';
import {Authentication, RoleManagement} from '../middlewares'

module.exports = (app) => {

    app.route('/member-groups')
        .delete([Authentication.isAuth], memberGroupController.leaveGroup);

    app.route('/member-groups/conversations')
        .delete([Authentication.isAuth], memberGroupController.clearConversation)
};
