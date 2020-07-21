require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")


const app = express()

const cors = require("cors")
// var corsOptions = {
//     origin: ["http://192.168.0.13:8080","http://localhost:8080","https://localhost:8080","http://www.adurboatsales.co.uk","https://www.adurboatsales.co.uk"]
// }
app.use(cors())

app.use('/boats', express.static('assets/images/boats'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");


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