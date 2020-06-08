require('dotenv').config()
const db = require("../models");
const UserModel = db.user;
const RoleModel = db.role;
const Op = db.Sequelize.Op;
const RefreshTokenModel = db.refreshToken;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    UserModel.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
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
            username: req.body.username
        }
    })
        .then(dbUser => {
            if (!dbUser) {
                return res.status(404).send({ message: "User Not found." });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                dbUser.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            let token = jwt.sign({ id: dbUser.id }, process.env.TOKEN_SECRET, {
                expiresIn: parseInt(process.env.TOKEN_SECRET_EXPIRY_SECONDS)
            });

            let refreshToken = jwt.sign({ id: dbUser.id }, process.env.REFRESH_TOKEN_SECRET);

            RefreshTokenModel.create({
                refreshtoken_hash: bcrypt.hashSync(refreshToken, 8)
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
                    id: dbUser.id,
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

//this needs to go through database and delete the hashed token
exports.signout = (req, res) => {
    RefreshTokenModel.destroy({
        where: {
            refreshtoken_hash: bcrypt.hashSync(req.body.refresh_token, 8)
        }
    })
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
};

exports.refresh = (req, res) => {
    const refreshToken = req.body.refreshToken
    if (refreshToken == null) return res.sendStatus(401)

    const foundToken = RefreshTokenModel.findOne({ where: { refreshtoken_hash: bcrypt.hashSync(refreshToken, 8) } });
    if (foundToken === null) {
        console.log("didnt find token" )
        res.sendStatus(403)
    }
    console.log("foundToken :",foundToken)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, tokenUser) => {
        if (err) return res.sendStatus(403)
        console.log("found token user :",tokenUser.id)
        UserModel.findOne({
            where: {
                id: tokenUser.id
            }
        })
        .then(dbUser => {
            console.log("found db user :", dbUser)
            const accessToken = jwt.sign({id: dbUser.id}, process.env.TOKEN_SECRET, {
                expiresIn: parseInt(process.env.TOKEN_SECRET_EXPIRY_SECONDS)
            });
            res.json({accessToken: accessToken})
        });
    })
};
