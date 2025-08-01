const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema({

    subscriber : {
        type:mongoose.Schema.Types.ObjectId,   // one who is subscribing
        ref : "user"
    },
    channel : {
        type:mongoose.Schema.Types.ObjectId,  //one to whom "subscriber is subscribing"
        ref : "user",
    }
    
}, { timestamps: true })
  

//--> used .pre  hook for bcrypt at 28 User and video model with hooks and JWT
const subscription = mongoose.model("subscription",subscriptionSchema)
module.exports = subscription;