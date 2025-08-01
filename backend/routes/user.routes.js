const express  = require("express");
const router  = express.Router();
const {registerUser, loginUser , logoutUser, refreshAccessToken} = require("./../controller/user.controller");
const upload = require("./../middleware/multer");
const {verifyJWT} = require("../middleware/auth.middleware");




router.post("/register", upload.fields([{name:"avatar"},{name:"coverImage"}]), registerUser);

router.post("/login",loginUser);

router.post("/logout",verifyJWT,logoutUser)
router.post('/refresh-token',refreshAccessToken);


module.exports = router; 