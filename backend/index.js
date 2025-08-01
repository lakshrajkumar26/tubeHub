const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors")
const PORT = 3000;
const db = require("./db/dbconn");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");

// const fs = require("fs");
// const path = require("path");
//for multer 


// const tempDir = path.join(__dirname, "public", "temp");
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }




app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true,
}))

app.use(express.json());   //{limit:"16kb"}
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParser());





app.use("/api/user",userRoutes);

app.get("/home",(req,res)=>{
    res.send("server is running,hi sajal");
})
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
})
