module.exports = (sequelize, Sequelize) => {
    const Owner = sequelize.define("owners", {
    ownerid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ownerName: {
        type: Sequelize.STRING,
        max:100
    },
    ownerPhone: {
        type: Sequelize.STRING,
        max:50
    },
    ownerAddress: {
        type: Sequelize.STRING,
        max:255
    },
    ownerEmail: {
        type: Sequelize.STRING,
        max:100
    },
    ownerPrice: {
        type: Sequelize.STRING,
        max:100
    },
    ownerNotes: {
        type: Sequelize.STRING,
        max: 255
    }
    });

    return Owner;
};