'use strict';

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            authorId: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            groupId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            body: {
                type: DataTypes.JSON
            },
            type: {
                type: DataTypes.STRING
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            deletedAt: {
                type: DataTypes.DATE
            }
        },
        {
            paranoid: true,
            freezeTableName: true,
        }
    );

    Message.associate = (models) => {
        Message.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'CASCADE'
        });
        Message.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'CASCADE'
        });
    };

    return Message;
};