module.exports = {
    up: function (queryInterface, DataTypes) {
        return queryInterface.createTable('MemberGroup', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            groupId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    key: 'id',
                    model: 'Group',
                }
            },
            clearedAt: {
                type: DataTypes.DATE,
            },
            userId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    key: 'id',
                    model: 'User',
                }
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            deletedAt: {
                type: DataTypes.DATE
            }
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('MemberGroup');
    }
};
