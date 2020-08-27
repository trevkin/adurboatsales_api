require('dotenv').config()
const config = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PORT: process.env.DB_PORT,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    dialect: process.env.DB_TYPE,
    pool: {
        max: parseInt(process.env.DB_POOL_SIZE),
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        port: config.PORT,
        dialect: config.dialect,
        operatorsAliases: false,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        },
        define: {
            //prevent sequelize from pluralizing table names
            freezeTableName: true
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.boat = require("../models/boat.model.js")(sequelize, Sequelize);
db.owner = require("../models/owner.model.js")(sequelize, Sequelize);
db.boats_owned = require("../models/boats_owned.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refresh_token.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId"
});
db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId"
});
db.owner.belongsToMany(db.boat, {
    through: "boats_owned",
    foreignKey: "ownerId",
    otherKey: "boatId"
});
db.boat.belongsToMany(db.owner, {
    through: "boats_owned",
    foreignKey: "boatId",
    otherKey: "ownerId"
});

db.ROLES = ["user", "admin"];

module.exports = db;