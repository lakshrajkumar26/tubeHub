const mongoose = require("mongoose");
 const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");   //plugin
 const videoSchema = new mongoose.Schema({
   
    videoFile:{
        type: String,
        required: true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    title : {
        type:String,
        required:true,
    },
    description:{
        type: String,
        required :true
    },
    duration : {
        type: Number,
        required : true,
    }, 
    views:{
        type : Number,
        default : 0,
    },
    isPublished : {
        type : Boolean,
        default : true,
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
   

 },{timestamp:true}) 
 
 videoSchema.plugin(mongooseAggregatePaginate)
 
const video = mongoose.model("video",videoSchema);

 module.exports = video;