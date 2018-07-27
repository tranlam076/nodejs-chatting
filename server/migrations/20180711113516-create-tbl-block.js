module.exports = {
    up: function (queryInterface, DataTypes) {
        return queryInterface.createTable('Block', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, primaryKey: true
            },
            authorId: {
                type: DataTypes.UUID,
                references: {
                    key: 'id',
                    model: 'User',
                }
            },
            userId: {
                type: DataTypes.UUID,
                references: {
                    key: 'id',
                    model: 'User',
                }
            },
            groupId: {
                type: DataTypes.UUID,
                references: {
                    key: 'id',
                    model: 'Group',
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
        return queryInterface.dropTable('Block');
    }
};

//create new migration files for insert column, update column, update column properties, remove column.