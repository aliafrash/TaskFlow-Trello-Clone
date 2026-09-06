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
    },


    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            },
            text:{
                type:String,
                required:true,
                trim:true
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],


    activities:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            },
            action:{
                type:String,
                required:true
            },
            details:{
                type:String,
                required:true
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Task",
    taskSchema
);