const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const multer  = require('multer')
const upload = multer({ dest: '../uploads/' })

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/boat/list", controller.getBoatListPublic);

    app.get("/api/boat", controller.getBoatPublic);

    app.post(
        "/api/boat/add",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.addBoat
    );

    app.post(
        "/api/boat/update",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.updateBoat
    );

    app.post(
        "/api/boat/image/add",
        [authJwt.verifyToken, authJwt.isAdmin, upload.array('files', 12)],
        controller.addBoatImage
    )

    app.get(
        "/api/boat/image/swap",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.swapBoatImages
    );

    app.delete(
        "/api/boat/image/delete",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.deleteBoatImage
    );

    app.get("/api/test/all", controller.allAccess);
    
    app.get(
        "/api/test/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/api/test/user",
        [authJwt.verifyToken],
        controller.userBoard
    );
};