'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                unique: {
                    args: true,
                    msg: 'USERNAME_ALREADY_USING'
                }
            },
            password: {
                type: DataTypes.STRING
            },
            address: {
                type: DataTypes.ARRAY(DataTypes.STRING)
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
            paranoid: true,  //true: soft delete, false: hard delete.
            freezeTableName: true, //if false => table name will be changed: User => Users
            classMethods: {
                generateHash(password) {
                    return BCrypt
                        .hash(password, 8)
                        .then((data) => {
                            return data;
                        })
                        .catch(() => {
                            return false;
                        });
                }
            }
        }
    );

    User.associate = (models) => {
        User.hasMany(models.Group, {
            as: 'Group',
            foreignKey: 'authorId'
        });
    };

    return User;
};