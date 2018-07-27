'use strict';

module.exports = (sequelize, DataTypes) => {
    const Block = sequelize.define('Block',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            authorId: {
                type: DataTypes.UUID
            },
            userId: {
                type: DataTypes.UUID
            },
            groupId: {
                type: DataTypes.UUID
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

    Block.associate = (models) => {
        Block.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'CASCADE'
        });
        Block.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'CASCADE'
        });
        Block.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'CASCADE'
        });
    };

    return Block;
};