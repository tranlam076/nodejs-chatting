'use strict';

import {messageController} from '../controllers/index';

module.exports = (app) => {

    app.route('/messages')
        .get(messageController.getListMessage)
        .post(messageController.createMessage);

    app.route('/messages/:id')
        .get(messageController.getOneMessage)
        .put(messageController.updateMessage)
        .delete(messageController.deleteMessage);

};
