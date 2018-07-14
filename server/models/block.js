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
                allowNull: false,
                type: DataTypes.UUID,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            groupId: {
                allowNull: false,
                type: DataTypes.UUID,
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
            onDelete: 'CASCADE'
        });
        Block.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE'
        });
        Block.belongsTo(models.Group, {
            foreignKey: 'groupId',
            onDelete: 'CASCADE'
        });
    };

    return Block;
};