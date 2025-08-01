const { v2 } = require("cloudinary");
const fs = require("fs");

v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await v2.uploader.upload(localFilePath);

        // console.log("file uploaded on cloudinary", response.url);
         fs.unlinkSync(localFilePath)   //-->aagr successfulyy to bhi remove
        return response;
    }catch(err){
        console.log(err);
        fs.unlinkSync(localFilePath); // //-->aagr err aaya  to bhi remove
        return null;
    }
    

}
module.exports = uploadOnCloudinary;