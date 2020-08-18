require('dotenv').config()
const db = require("../models");
const UserModel = db.user;
const RoleModel = db.role;
const Op = db.Sequelize.Op;
const RefreshTokenModel = db.refreshToken;
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
    // Save User to Database
    UserModel.create({
        userName: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(user => {
            if (req.body.roles) {
                RoleModel.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    UserModel.findOne({
        where: {
            userName: req.body.username
        }
    })
        .then(dbUser => {
            if (!dbUser) {
                return res.status(404).send({ message: "User Not found." });
            }

            let passwordIsValid = dbUser.verifyPassword(req.body.password);

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            let token = jwt.sign({ id: dbUser.userId }, process.env.TOKEN_SECRET, {
                expiresIn: parseInt(process.env.TOKEN_SECRET_EXPIRY_SECONDS)
            });

            let refreshToken = jwt.sign({ id: dbUser.userId }, process.env.REFRESH_TOKEN_SECRET);

            RefreshTokenModel.create({
                userId: dbUser.userId,
                refreshToken: refreshToken
            })
            .then(user => {
                console.log("refresh token saved to db")
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });

            let authorities = [];
            dbUser.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    id: dbUser.userId,
                    username: dbUser.username,
                    email: dbUser.email,
                    roles: authorities,
                    accessToken: token,
                    refreshToken: refreshToken
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

//this goes through database and deletes the hashed token
exports.signout = (req, res) => {
    console.log("signout called")
    RefreshTokenModel.destroy({
        where: {
            refreshToken: req.body.refresh_token
        }
    })
    res.sendStatus(204)
};

//this deletes all refreshTokens from the db that are associated with this userId
exports.signoutall = (req, res) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, tokenUser) => {
        if (err) return res.sendStatus(403)
        RefreshTokenModel.destroy({
            where: {
                userId: tokenUser.id
            }
        })
        res.sendStatus(204)
    })
};

exports.refresh = (req, res) => {
    //console.log("refresh")
    const refreshToken = req.body.refreshToken
    if (refreshToken == null) {
        console.log("no refresh token provided")
        return res.status(401).send({ message: 'no refresh token provided' });
    }

    console.log("token in header:",refreshToken)
    RefreshTokenModel.findOne(
        {
            where: { refreshToken: refreshToken }
        })
        .then(dbRefreshToken => {

            if (dbRefreshToken === null) {
                console.log("didnt find token in db" )
                return res.status(401).send({ message: 'Refresh token is invalid' });
            }

            console.log("found refreshToken in db:",dbRefreshToken)
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, tokenUser) => {
                if (err) return res.status(401).send({ message: 'Refresh token could not be verified' })
                console.log("token user in db refreshtoken:",tokenUser.id)
                UserModel.findOne({
                    where: {
                        userId: tokenUser.id
                    }
                })
                .then(dbUser => {
                    console.log("found db user :", dbUser.userId)
                    const accessToken = jwt.sign({id: dbUser.userId}, process.env.TOKEN_SECRET, {
                        expiresIn: parseInt(process.env.TOKEN_SECRET_EXPIRY_SECONDS)
                    });
                    console.log("new access token is:", accessToken)
                    res.json({accessToken: accessToken})
                });
        })
    })
};

