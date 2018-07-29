'use strict';

module.exports = (sequelize, DataTypes) => {
    const MemberGroup = sequelize.define('MemberGroup',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            groupId: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            userId: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            clearedAt: {
                type: DataTypes.DATE,
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

    MemberGroup.associate = (models) => {
        MemberGroup.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'CASCADE'
        });
        MemberGroup.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    return MemberGroup;
};