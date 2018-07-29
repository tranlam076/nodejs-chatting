import UserController from './user-controller';
import GroupController from './group-controller';
import MessageController from './message-controller';
import BlockController from './block-controller';
import MemberGroupController from "./member-group-controller";

module.exports = {
    userController: new UserController(),
    groupController: new GroupController(),
    messageController: new MessageController(),
    memberGroupController: new MemberGroupController(),
    blockController: new BlockController(),
};