const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB=require("./config/db");

const authRoutes=require("./routes/authRoutes");


const app=express();


connectDB();


app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth",authRoutes);



app.get("/",(req,res)=>{

    res.send("TaskFlow Backend API Running");

});


const PORT=process.env.PORT || 5000;


app.listen(PORT,()=>{

    console.log(`Server running on port ${PORT}`);

});