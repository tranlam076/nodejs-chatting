import UserController from './user-controller';
import GroupController from './group-controller';
import MessageController from './message-controller';

module.exports = {
    userController: new UserController(),
    groupController: new GroupController(),
    messageController: new MessageController(),
};