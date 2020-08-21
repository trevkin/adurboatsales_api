const db = require("../models")
const BoatModel = db.boat
const BoatsOwnedModel = db.boats_owned
const fs = require('fs')
const jimp = require("jimp")
const glob = require('glob')
const imageSuffixes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q']
const sizeOf = require('image-size')



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
    if (req.body.params.boat) {
        let boat = req.body.params.boat
        sqlQuery = 'UPDATE boats SET boatName=?, boatPrice=?, boatStatus=?, boatLengthOA=?, boatLengthWater=?, boatBeam=?,' +
            ' boatDraft=?, boatDisplacement=?, boatEquipment=?, boatAccommodation=?, boatDescription=?, boatAdvert=?, ' +
            'ownerName=?, ownerEmail=?, ownerAddress=?, ownerPrice=?, ownerNotes=? WHERE boatId=?'

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
        sqlParameters.push(boat.ownerName)
        sqlParameters.push(boat.ownerEmail)
        sqlParameters.push(boat.ownerAddress)
        sqlParameters.push(boat.ownerPrice)
        sqlParameters.push(boat.ownerNotes)
        sqlParameters.push(boat.boatID)

        db.sequelize.query(sqlQuery, {
            replacements: sqlParameters,
            model: BoatModel,
            type: db.sequelize.QueryTypes.UPDATE
        })
        .then(updateArray => {
            if (updateArray) {
                res.status(200).send({
                    boat: JSON.stringify({boatID: boat.boatID, changeMade: updateArray[1]})
                });
            }
        })
    } else {
        res.status(400).send();
    }
};

exports.addBoatImage = (req, res) => {
    if (req.body.boatId && req.files) {
        let commonPath = __dirname + '/../assets/images/boats/' + req.body.boatId
        let currentImageCount = 0
        let badFiles = []
        glob(__dirname + '/../assets/images/boats/' + req.body.boatId + '*_thumb.jpg', {}, (err, files) => {
            currentImageCount = files.length
        })

        req.files.forEach((file, index) => {
            console.log("looping file:", file.originalname)

            jimp.read(file.path, function (err, image) {
                if (err) {
                    badFiles.push({file: file.originalname, error: "err"})
                    console.log(err)
                } else {
                    if (currentImageCount > imageSuffixes.length - 1) {
                        console.log("Exceeded boat image limit",  file.originalname)
                        badFiles.push({file: file.originalname, error: "Exceeded boat image limit"})
                    } else {
                        sizeOf(file.path, function (error, dimensions) {
                            if (!error) {

                                if (dimensions.width < 200) {
                                    badFiles.push({file: file.originalname, error: "Image too small"})
                                } else {
                                    let width = dimensions.width < 1024?dimensions.width:1024
                                    image
                                        .write(commonPath + imageSuffixes[currentImageCount] + "_thumb.jpg")
                                        .resize(200,jimp.AUTO)
                                    image
                                        .write(commonPath + imageSuffixes[currentImageCount] + ".jpg")
                                        .resize(width,jimp.AUTO)
                                }
                            } else {
                                badFiles.push({file: file.originalname, error: error})
                            }

                            currentImageCount++
                        })
                    }
                }
            })
        })
        if (badFiles.length === 0) {
            console.log("Boat Images Added")
            res.status(200).send("Boat Images Added")
        } else {
            console.log("Bad files")
            res.status(400).send(badFiles)
        }
    } else {
        console.log("Missing Data")
        res.status(500).send("Missing Data")
    }
};

exports.deleteBoatImage = (req, res) => {
    if (req.query.boatId !== '' && req.query.imageSuffix !== '') {
        let imageSuffix = req.query.imageSuffix
        let index = imageSuffixes.indexOf(imageSuffix)
        let commonPath = __dirname+'/../assets/images/boats/'+req.query.boatId
        fs.unlinkSync(commonPath + imageSuffix + ".jpg")
        fs.unlinkSync(commonPath + imageSuffix + "_thumb.jpg")

        if (index < imageSuffixes.length-1) {
            for(let i=index;i<imageSuffixes.length-1;i++) {
                if (fs.existsSync(commonPath + imageSuffixes[i+1] + ".jpg")) {
                    console.log(imageSuffixes[i])
                    fs.renameSync(commonPath + imageSuffixes[i+1] + ".jpg", commonPath + imageSuffixes[i] + ".jpg")
                    fs.renameSync(commonPath + imageSuffixes[i+1] + "_thumb.jpg", commonPath + imageSuffixes[i] + "_thumb.jpg")
                }
            }
        }
        res.status(200).send("Boat Image Deleted");
    } else {
        res.status(400).send("Something went wrong");
    }


};

exports.swapBoatImages = (req, res) => {
    if (req.query.boatId !== '' && req.query.firstImageSuffix !== '' && req.query.secondImageSuffix !== '') {
        let firstSuffix = req.query.firstImageSuffix
        let secondSuffix = req.query.secondImageSuffix
        let commonPath = __dirname+'/../assets/images/boats/'+req.query.boatId

        try {
            fs.renameSync(commonPath + firstSuffix + ".jpg", commonPath + firstSuffix + "_temp.jpg")
            fs.renameSync(commonPath + firstSuffix + "_thumb.jpg", commonPath + firstSuffix + "_thumb_temp.jpg")
            fs.renameSync(commonPath + secondSuffix + ".jpg", commonPath + firstSuffix + ".jpg")
            fs.renameSync(commonPath + secondSuffix + "_thumb.jpg", commonPath + firstSuffix + "_thumb.jpg")
            fs.renameSync(commonPath + firstSuffix + "_temp.jpg", commonPath + secondSuffix + ".jpg")
            fs.renameSync(commonPath + firstSuffix + "_thumb_temp.jpg", commonPath + secondSuffix + "_thumb.jpg")
            res.status(200).send()
        } catch (e) {
            console.log("swap error:", e.message)
            res.status(500).send("There was a problem with swapping the images: "+e.message)
        }
    }
    else {
        res.status(400).send("Something wrong when swapping the images")
    }

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