module.exports = (sequelize, Sequelize) => {
    var bcrypt = require("bcryptjs");
    const User = sequelize.define("users", {
        userId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    });

    User.beforeCreate((user, options) => {

        return bcrypt.hash(user.password, 8)
            .then(hash => {
                user.password = hash;
            })
            .catch(err => {
                throw new Error();
            });
    });

    User.prototype.verifyPassword = function (hash) {
        console.log("password:", this.password, hash);
        return bcrypt.compareSync(hash, this.password);
    }
    return User;
};
