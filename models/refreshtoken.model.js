module.exports = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("refresh_tokens", {
        refreshtoken_hash: {
            type: Sequelize.STRING
        }
    });

    return RefreshToken;
};