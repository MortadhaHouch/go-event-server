const { Router } = require("express");
const User = require("../models/User");
const userRouter = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
userRouter.get("/",async (req,res)=>{
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }
})
userRouter.post("/signup",async(req,res)=>{
    try {
        const {_firstName,_lastName,_email,_password,_phoneNumber,_address} = req.body;
        const userByEmail = await User.findOne({_email:_email});
        if(userByEmail){
            return res.status(400).json({message:"User already exists"});
        }else{
            const user = await User.create({_firstName,_lastName,_email,_password,_phoneNumber,_address});
            res.status(201).json(user);
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})
userRouter.post("/login",async(req,res)=>{
    try {
        const {_email,_password} = req.body;
        const user = await User.findOne({_email:_email});
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }else{
            const isPasswordMatch = await bcrypt.compare(_password,user._password);
            if(isPasswordMatch){
                const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
                res.status(200).json({token});
            }else{
                return res.status(400).json({message:"Invalid credentials"});
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})
module.exports = userRouter;