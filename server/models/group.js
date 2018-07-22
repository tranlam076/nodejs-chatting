'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING
            },
            authorId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            avatar: {
                type: DataTypes.STRING
            },
            type: {
                type: DataTypes.ENUM(['private', 'group'])
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

    Group.associate = (models) => {
        Group.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'CASCADE'
        });
        Group.hasMany(models.MemberGroup, {
            foreignKey: 'groupId',
            as: 'members'
        });
        Group.hasMany(models.Block, {
            foreignKey: 'groupId',
            as: 'blocks'
        });
    };

    return Group;
};