const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



// Register User
exports.register = async (req,res)=>{

    try{

        const {name,email,password}=req.body;


        const existingUser = await User.findOne({email});


        if(existingUser){

            return res.status(400).json({
                message:"User already exists"
            });

        }



        const hashedPassword = await bcrypt.hash(password,10);



        const user = await User.create({

            name,
            email,
            password:hashedPassword

        });



        res.status(201).json({

            message:"User registered successfully"

        });


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};




// Login User
exports.login = async(req,res)=>{


    try{


        const {email,password}=req.body;



        const user = await User.findOne({email});



        if(!user){

            return res.status(400).json({
                message:"Invalid credentials"
            });

        }



        const isMatch = await bcrypt.compare(
            password,
            user.password
        );



        if(!isMatch){

            return res.status(400).json({
                message:"Invalid credentials"
            });

        }



        const token = jwt.sign(

            {
                id:user._id,
                role:user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );



        res.json({

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        });



    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

// Get Current User Profile (Me)
exports.getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};