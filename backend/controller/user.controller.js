const User = require("./../models/user.model");
const bcrypt = require("bcrypt");
const uploadOnCloudinary = require("./../utils/cloudinary");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

//  !fullName?.trim() => true; if fullName is undefined | fullName is null |fullName is an empty string "" | fullName is spaces only " "
const registerUser = async (req, res) => {

    try {
        const { username, email, fullName, password } = req.body;
        //    if(!fullName || !username || !email || !password) return res.status(400).json({message : "Enter a valid details"});

        if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) { return res.status(400).json({ message: "Enter valid details" }); }
        //  fullName.trim()  === true so means blanak  so (!) || and ? so undefined  

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existedUser) {
            return res.status(409).json({ message: "User with email or username already exist" })
        }
        //hash Password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // req.files.avatar[0].path;
        const avatarLocalPath = req.files?.avatar[0]?.path;  //by multer syd 


        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if (!avatarLocalPath) {
            return res.status(400).json({ message: "avatar local Path not found : avatar file required" })
        }
        let coverImageLocalPath
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }




        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!avatar) { return res.status(400).json({ message: "avatar url not found " }) }

        const newUser = await User.create({ username: username.toLowerCase(), email, fullName, password: hashedPassword, avatar: avatar.url, coverImage: coverImage?.url || "", })  //=> ? hain then nikal li || or rehnedo 


        const createdUser = await User.findById(newUser._id).select("-password -refreshToken"); //default all select so remove pass,refreshtoken

        const token = jwt.sign({ id: newUser._id, email: newUser.email, username: newUser.username, fullName: newUser.fullName }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const RefreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });



        res.cookie("user", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour in ms
        });
        newUser.refreshToken = RefreshToken;
        await newUser.save({ ValidateBeforeSave: false });    //for --. all required field measn validation off h .save pe 


        if (!createdUser) {
            return res.status(500).json({ message: "something went wrong while registering new user " })
        }
        return res.status(200).json({ message: `new UserId  created Successfully`, newUser, createdUser, token })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "error :", err })
    }

}

const loginUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email?.trim() || !username?.trim() || !password?.trim()) { return res.status(500).json({ message: "Enter  valid details" }) }

        const searchUser = await User.findOne({ $or: [{ email }, { username }] }) // for any one 
        const isMatch = await bcrypt.compare(password, searchUser.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid user credentials" })
        }

        const accessToken = jwt.sign({ id: searchUser._id, email: searchUser.email, username: searchUser.username, fullName: searchUser.fullName }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: searchUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        const loggedUser = await User.findById(searchUser._id).select("-password -refreshToken");

        const options = {      // --> by this only modify by server  || no can modify by forntend 
            httpOnly: true,
            secure: true,
        }




        res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken).json({ user: loggedUser, accessToken, refreshToken, message: "User logged in successfully" })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "error :", err })
    }


}


const logoutUser = async (req, res) => {
    try {
        const loggedUser = req.user;
        console.log("current LoggedIn user detail", loggedUser);

        await User.findByIdAndUpdate(loggedUser.id, { $set: { refreshToken: undefined } }, { new: true });   //why new

        //everytime  option lgega  for cookie 
        const options = {
            httpOnly: true,
            secure: true,
        }
        res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({ message: "user logged out" })

    }
    catch (err) {
        console.log("err occured while logout", err)
        res.status(401).json("logout Unsuccessful");
    }
}
//cehck this
const refreshAccessToken = async (req, res) => {
    try {

        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken  //==> body for andrioud

        if (!incomingRefreshToken) { return res.status(401).json("unauthorized access") }

        const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decoded?.id);
        if (!user) { return res.status(401).json("invalid refreshToken") }

        //now match both
        if (incomingRefreshToken !== user?.refreshToken) { return res.status(401).json("refreshToken is not matching means expired aor used") }

        //if matched then generate new accsess and refreshToken 
        const newToken = jwt.sign({ id: user._id, email: user.email, username: user.username, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        //save new refreshToken 
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        //to set in cookie always needs option
        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200).cookie("accessToken", newToken, options).cookie("refreshToken", newRefreshToken, options).json("Access Token refreshed")

    }
    catch (err) {
        console.log("err occured while generating new Token", err)
        res.status(401).json("Invalid refresh token");

    }

}
const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) { return res.status(500).json({ message: "password are different" }) }

        req.user?.id

        const searchUser = await User.findById(req.user?.id)

        const isMatch = await bcrypt.compare(oldPassword, searchUser.password);

        if (!isMatch) { return res.status(500).json({ message: "password doesn't Matched" }) }

        const newHashedPass = await bcrypt.hash(newPassword, 10);

        searchUser.password = newHashedPass;
        await searchUser.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "Password changed Successfully" })
    }
    catch (err) {
        console.log("err occured while generating new Password", err)
        res.status(401).json("Passsword not Changed");
    }


    const getCurrentUser = (req, res) => {
        try {
            return res.status(200).json({ req, user, message: "current user fetched successfully" })
        }
        catch (err) {
            console.log("err occured while fetching ", err)
            res.status(401).json("Unknown current user");
        }
    }

}
module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword }; 