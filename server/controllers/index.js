import UserController from './user-controller';
import GroupController from './group-controller';
import MessageController from './message-controller';
import BlockController from './block-controller';

module.exports = {
    userController: new UserController(),
    groupController: new GroupController(),
    messageController: new MessageController(),
    blockController: new BlockController(),
};