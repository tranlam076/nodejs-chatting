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
            partnerId: {
                type: DataTypes.UUID,
                references: {
                    model: 'User',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            type: {
                type: DataTypes.ENUM(['private', 'group']),
                allowNull: false
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
