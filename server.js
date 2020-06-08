require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()

var corsOptions = {
    origin: ["http://localhost:8080","https://localhost:8080","http://www.adurboatsales.co.uk","https://www.adurboatsales.co.uk"]
}

app.use(cors(corsOptions))


// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
// const Role = db.role;
// const User = db.user;
//
// db.sequelize.sync({force: true}).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });
//
// function initial() {
//     Role.create({
//         roleid: 1,
//         name: "user"
//     });
//
//     Role.create({
//         roleid: 2,
//         name: "moderator"
//     });
//
//     Role.create({
//         roleid: 3,
//         name: "admin"
//     });
//
//     User.create({
//         username:"graham",
//         password: "labybee"
//     })
// }

db.sequelize.sync()

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to adurboatsales api." });
});

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.HTTP_PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});