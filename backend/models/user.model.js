const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,    //for search
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    password: {
        type: String
    },
    avatar: {
        type: String,   //URL
        required: true,
    },
    coverImage: {
        type: String
    },
    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })
  

//--> used .pre  hook for bcrypt at 28 User and video model with hooks and JWT
const user = mongoose.model("user",UserSchema)