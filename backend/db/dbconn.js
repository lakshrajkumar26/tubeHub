const mongoose = require("mongoose");   
const dotenv = require("dotenv").config();

mongoose.connect(process.env.MONGOURL);    

const db = mongoose.connection;

db.on("connected",()=>{
    console.log("successfully")
})

db.on("disconnected",()=>{
    console.log("disconnected successfully")
})
db.on("error",(err)=>{
    console.log("error occured:",err)
})
module.exports = db;


