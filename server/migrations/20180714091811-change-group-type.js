module.exports = {
    up  : function (queryInterface, DataTypes) {
        return queryInterface
            .changeColumn('Group', 'type', {
                type: DataTypes.ENUM,
                values: ['private', 'group'],
                allowNull: false
            });
    },
    down: function (queryInterface, DataTypes) {
        return queryInterface
            .changeColumn('Group', 'type', {
                type: DataTypes.STRING,
                allowNull: false
            });
    }
};