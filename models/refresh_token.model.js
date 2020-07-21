module.exports = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("refresh_tokens", {
        refreshTokenId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER
        },
        refreshToken: {
            type: Sequelize.STRING
        }
    });

    return RefreshToken;
};