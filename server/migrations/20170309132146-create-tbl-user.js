module.exports = {
    up: function (queryInterface, DataTypes) {
        return queryInterface.createTable('User', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                validate: {
                    max: 25,
                    min: 10,
                }
            },
            avatar: {
                type: DataTypes.STRING
            },
            isActive: {
                type: DataTypes.BOOLEAN,
            },
            address: {
                type: DataTypes.ARRAY(DataTypes.STRING),
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
        return queryInterface.dropTable('User');
    }
};