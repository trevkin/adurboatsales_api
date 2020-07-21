module.exports = (sequelize, Sequelize) => {
    const Boat = sequelize.define("boats", {
        boatId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        boatCounter: {
            type: Sequelize.INTEGER
        },
        boatNumber: {
            type: Sequelize.STRING
        },
        boatName: {
            type: Sequelize.STRING,
            max:100
        },
        boatModel: {
            type: Sequelize.STRING,
            max:255
        },
        boatManufacturer: {
            type: Sequelize.STRING,
            max:255
        },
        boatHull: {
            type: Sequelize.STRING,
            max:255
        },
        boatLengthOA: {
            type: Sequelize.STRING,
            max:10
        },
        boatLengthWater: {
            type: Sequelize.STRING,
            max:10
        },
        boatBeam: {
            type: Sequelize.STRING,
            max:10
        },
        boatDraft: {
            type: Sequelize.STRING,
            max:10
        },
        boatDisplacement: {
            type: Sequelize.STRING,
            max:10
        },
        boatEngine: {
            type: Sequelize.STRING,
            max:255
        },
        boatEquipment : {
            type: Sequelize.TEXT
        },
        boatAccommodation: {
            type: Sequelize.TEXT
        },
        boatDescription: {
            type: Sequelize.TEXT
        },
        boatPrice: {
            type: Sequelize.STRING,
            max:20
        },
        boatShortDesc: {
            type: Sequelize.STRING,
            max:255
        },
        boatLocation: {
            type: Sequelize.STRING,
            max:255
        },
        boatType: {
            type: Sequelize.CHAR,
            max:1
        },
        boatImage: {
            type: Sequelize.INTEGER,
            max:2
        },
        boatAdvert: {
            type: Sequelize.TEXT
        },
        boatStatus: {
            type: Sequelize.STRING,
            max:10
        },
        boatFeatured : {
            type: Sequelize.CHAR,
            max: 1
        }
    });

    return Boat;
};