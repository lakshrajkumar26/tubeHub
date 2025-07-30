const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors")
const PORT = 3000;
const db = require("./db/dbconn");
const cookieParsar = require("cookie-parser");


app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true,
}))

app.use(express.json());   //{limit:"16kb"}
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParsar);


app.get("/home",(req,res)=>{
    res.send("server is running,hi sajal");
})
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
})
