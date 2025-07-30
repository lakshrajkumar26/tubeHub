const express  = require("express");
const router  = express.Router();
const {registerUser} = require("./../controller/user.controller");

router.get("/register",registerUser);

module.exports = router; 