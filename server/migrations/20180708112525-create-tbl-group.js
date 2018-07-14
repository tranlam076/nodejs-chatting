module.exports = {
    up: function (queryInterface, DataTypes) {
        return queryInterface.createTable('Group', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            authorId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: { //
                    key: 'id',
                    model: 'User',
                }
            },
            avatar: {
                type: DataTypes.STRING
            },
            type: {
                type: DataTypes.STRING
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
        return queryInterface.dropTable('Group');
    }
};
