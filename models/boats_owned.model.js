module.exports = (sequelize, Sequelize) => {
    const BoatsOwned = sequelize.define("boats_owned", {
        ownersPrice: {
            type: Sequelize.INTEGER
        },
        brokersPrice: {
            type: Sequelize.INTEGER
        },
        currentOwner: {
            type: Sequelize.CHAR,
            default:'Y'
        }
    });
    return BoatsOwned;
};