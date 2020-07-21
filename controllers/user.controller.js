const db = require("../models");
const BoatModel = db.boat;
const BoatsOwnedModel = db.boats_owned;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.getBoatListPublic = (req, res) => {
    let sqlQuery = 'SELECT boatId, boatNumber, boatName, boatShortDesc, boatPrice ' +
        'FROM boats ' +
        'WHERE 1=1 '
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
    db.sequelize.query(sqlQuery, {
        replacements: sqlParameters,
        model: BoatModel,
        type: db.sequelize.QueryTypes.SELECT
    }).then(dbBoats => {
        if (dbBoats) {
            res.status(200).send({
                boats: JSON.stringify(dbBoats)
            });
        }
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