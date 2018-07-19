'use strict';

import {blockController} from '../controllers/index';
import {Authentication} from '../middlewares'


module.exports = (app) => {

    app.route('/blocks')
        .get([Authentication.isAuth], blockController.getListBlocks)
        .post([Authentication.isAuth], blockController.createBlock);

    app.route('/blocks/:id')
        .get([Authentication.isAuth], blockController.getOneBlock)
        .put([Authentication.isAuth], blockController.updateBlock)
        .delete([Authentication.isAuth], blockController.deleteBlock);
};
