const Task = require("../models/Task");


// Create Task
exports.createTask = async(req,res)=>{


    try{


        const {
            title,
            description
        } = req.body;


        const task = await Task.create({

            title,

            description,

            creator:req.user._id

        });


        res.status(201).json(task);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// Get Tasks
exports.getTasks = async(req,res)=>{


    try{


        let tasks;


        if(req.user.role==="admin"){

            tasks = await Task.find()
            .populate("creator","name email")
            .populate("assignedUser","name email");


        }
        else{


            tasks = await Task.find({

                $or:[
                    {
                        creator:req.user._id
                    },
                    {
                        assignedUser:req.user._id
                    }
                ]

            })
            .populate("creator","name email")
            .populate("assignedUser","name email");


        }


        res.json(tasks);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// Update Task
exports.updateTask = async(req,res)=>{


    try{


        const task = await Task.findById(
            req.params.id
        );


        if(!task){

            return res.status(404).json({
                message:"Task not found"
            });

        }


        task.title =
            req.body.title || task.title;


        task.description =
            req.body.description || task.description;


        await task.save();


        res.json(task);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// Delete Task
exports.deleteTask = async(req,res)=>{


    try{


        const task = await Task.findById(
            req.params.id
        );


        if(!task){

            return res.status(404).json({
                message:"Task not found"
            });

        }


        await task.deleteOne();


        res.json({
            message:"Task deleted"
        });


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// Update Status
exports.updateStatus = async(req,res)=>{


    try{


        const {
            status
        } = req.body;


        if(
            ![
                "todo",
                "doing",
                "done"
            ].includes(status)
        ){

            return res.status(400).json({
                message:"Invalid status"
            });

        }


        const task =
        await Task.findByIdAndUpdate(

            req.params.id,

            {
                status
            },

            {
                new:true
            }

        );


        res.json(task);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};