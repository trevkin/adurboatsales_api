const db = require("../models");
const BoatModel = db.boat;
const BoatsOwnedModel = db.boats_owned;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.getBoatListPublic = (req, res) => {
    console.log("getBoatListPublic")
    let sqlQuery = 'SELECT boatId, boatNumber, boatName, boatShortDesc, boatPrice, boatModel, boatManufacturer, boatLengthOA ' +
        'FROM boats WHERE 1=1 '
    let sqlParameters = []

    if (req.query.type !== '') {
        sqlQuery += ' AND boatType = ? '
        sqlParameters.push(req.query.type)
    }
    if (req.query.status !== undefined && req.query.status !== '') {
        sqlQuery += ' AND boatStatus = ? '
        sqlParameters.push(req.query.status)
    }
    sqlQuery += ' ORDER BY ? ? LIMIT ?, ?'
    sqlParameters.push(req.query.orderBy, req.query.order, parseInt(req.query.limitFrom), parseInt(req.query.batchSize))

    console.log(sqlQuery)
    console.log(sqlParameters)
    let output = db.sequelize.query(sqlQuery, {
        replacements: sqlParameters,
        model: BoatModel,
        type: db.sequelize.QueryTypes.SELECT
    })
        .then(dbBoats => {
            if (dbBoats) {
                console.log("returning boats")
                res.status(200).send({
                    boats: JSON.stringify(dbBoats)
                });
            }
        })
        .catch(error => {
            console.log("returning error:", error)
        })
};

exports.getBoatPublic = (req, res) => {
    let sqlQuery = 'SELECT * ' +
        'FROM boats ' +
        'WHERE boatId = ? '
    console.log(req.query.boatId || 0)
    let sqlParameters = [req.query.boatId || 0]

    console.log(sqlQuery)
    console.log(sqlParameters)
    db.sequelize.query(sqlQuery, {replacements: sqlParameters, model: BoatModel, type: db.sequelize.QueryTypes.SELECT})
        .then(dbBoat => {
            if (dbBoat[0]) {
                res.status(200).send({
                    boat: JSON.stringify(dbBoat[0])
                });
            }
        })
};

exports.addBoat = (req, res) => {
    console.log("addboat", req.body.params.type)
    if (req.body.params.type !== '' && req.body.params.name !== '') {
        let sqlQuery = 'SELECT MAX(boatCounter) as boatCounter FROM boats WHERE boatType = ?'
        let sqlParameters = [req.body.params.type]
        let highestNumber = 0

        db.sequelize.query(sqlQuery, {
            replacements: sqlParameters,
            model: BoatModel,
            type: db.sequelize.QueryTypes.SELECT
        })
            .then(dbBoat => {
                if (dbBoat[0]) {
                    highestNumber = dbBoat[0].boatCounter + 1
                    console.log(highestNumber)

                    sqlQuery = 'INSERT INTO boats (boatType, boatName, boatCounter, boatNumber, boatStatus, boatLengthOA, boatLengthWater, boatBeam, boatDraft, boatDisplacement, boatEquipment, boatAccommodation, boatDescription, boatAdvert) ' +
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'

                    sqlParameters = []

                    sqlParameters.push(req.body.params.type)
                    sqlParameters.push(req.body.params.name)
                    sqlParameters.push(highestNumber)
                    sqlParameters.push(req.body.params.type+'B'+highestNumber)
                    sqlParameters.push('P')
                    sqlParameters = sqlParameters.concat(['','','','','','','','',''])

                    db.sequelize.query(sqlQuery, {
                        replacements: sqlParameters,
                        model: BoatModel,
                        type: db.sequelize.QueryTypes.INSERT
                    })
                    .then(dbBoats => {
                        if (dbBoats) {
                            console.log("add boat",dbBoats[0])
                            res.status(200).send({
                                boats: JSON.stringify(dbBoats[0])
                            });
                        }
                    })
                }
            })


    } else {
        res.status(400).send();
    }
};

exports.updateBoat = (req, res) => {
    console.log("updateBoat", req.body.params.boat.boatName, req.body.params.boat.boatPrice)
    if (req.body.params.boat) {
        let boat = req.body.params.boat
        sqlQuery = 'UPDATE boats SET boatName=?, boatPrice=?, boatStatus=?, boatLengthOA=?, boatLengthWater=?, boatBeam=?, boatDraft=?, boatDisplacement=?, boatEquipment=?, boatAccommodation=?, boatDescription=?, boatAdvert=? WHERE boatId=?'

        sqlParameters = []
        sqlParameters.push(boat.boatName)
        sqlParameters.push(boat.boatPrice)
        sqlParameters.push(boat.boatStatus)
        sqlParameters.push(boat.boatLengthOA)
        sqlParameters.push(boat.boatLengthWater)
        sqlParameters.push(boat.boatBeam)
        sqlParameters.push(boat.boatDraft)
        sqlParameters.push(boat.boatDisplacement)
        sqlParameters.push(boat.boatEquipment)
        sqlParameters.push(boat.boatAccommodation)
        sqlParameters.push(boat.boatDescription)
        sqlParameters.push(boat.boatAdvert)
        sqlParameters.push(boat.boatId)

        db.sequelize.query(sqlQuery, {
            replacements: sqlParameters,
            model: BoatModel,
            type: db.sequelize.QueryTypes.UPDATE
        })
        .then(dbBoats => {
            if (dbBoats) {
                console.log("update boat",dbBoats[0])
                res.status(200).send({
                    boats: JSON.stringify(dbBoats[0])
                });
            }
        })
    } else {
        res.status(400).send();
    }
};

exports.addBoatImage = (req, res) => {
    res.status(200).send("Boat List Admin Content.");
};

exports.deleteBoatImage = (req, res) => {
    res.status(200).send("Boat List Admin Content.");
};

exports.boatListAdmin = (req, res) => {
    res.status(200).send("Boat List Admin Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};