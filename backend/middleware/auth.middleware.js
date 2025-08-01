const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./../models/user.model");

const verifyJWT = async (req, res, next) => {
    try {
        //    req.cookies?.accessToken  || req.header("Authorization").split(" ")[0]
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")   // => replace  now only "eyrreadf542jjdaf" 

        if (!token) { return res.status(401).json("Unauthorized Request") }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id).select("-password -refreshToken");

        if (!user) { return res.json(401).json({ message: "Invalid Access Token" }) }
        //
        req.user = user //ye krro  mwans req.user m aur kuch ni kis user ka token h ussi ko set krdo toh vo logout kr pae
        next();

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "invalid Access Token" })
    }

}
module.exports = { verifyJWT };