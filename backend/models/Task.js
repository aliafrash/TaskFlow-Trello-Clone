const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema(
{

    title:{
        type:String,
        required:true,
        trim:true
    },


    description:{
        type:String,
        required:true
    },


    status:{
        type:String,
        enum:[
            "todo",
            "doing",
            "done"
        ],
        default:"todo"
    },


    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    assignedUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },


    priority:{
        type:String,
        enum:[
            "low",
            "medium",
            "high"
        ],
        default:"medium"
    },


    dueDate:{
        type:Date,
        default:null
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Task",
    taskSchema
);