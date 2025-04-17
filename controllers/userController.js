const { Router } = require("express");
const User = require("../models/User");
const userRouter = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkUser = require("../middlewares/checkUser");
const fs = require("fs");
const mimeTypes = require("mime-types");
const fileUpload = require("express-fileupload");
const path = require("path");
const { v4 } = require("uuid");
require("dotenv").config();
userRouter.get("/",async (req,res)=>{
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }
})
userRouter.get("/profile",checkUser,async(req,res)=>{
    try {
        const {_id} = req.user;
        const user = await User.findById(_id);
        if(user){
            const follwersResults = [];
            const followingResults = [];
            for(let follower of user._followers){
                const foundUser = User.findById(follower);
                follwersResults.push(foundUser);
            }
            for(let following of user._following){
                const foundUser = User.findById(following);
                followingResults.push(foundUser);
            }
            const [_follwers,_following] = await Promise.all([follwersResults,followingResults]);
            res.status(200).json({
                _firstName:user._firstName,
                _lastName:user._lastName,
                _email:user._email,
                _phoneNumber:user._phoneNumber,
                _address:user._address,
                _profilePicture:user._profilePicture,
                _interests:user._interests,
                _follwers,
                _following
            });
        }else{
            res.status(404).json({message:"User not found"});
        }
    } catch (error) {
        console.log(error);
    }
})
userRouter.post("/signup",async(req,res)=>{
    try {
        const {_firstName,_lastName,_email,_password,_phoneNumber,_address} = req.body;
        const userByName = await User.findOne({_firstName,_lastName});
        if(userByName){
            return res.status(400).json({message:"User with this name exists"});
        }
        const userByEmail = await User.findOne({_email});
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
userRouter.post("/add-avatar",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const foundUser = await User.findById(req.user._id);
            if(!foundUser){
                return res.status(404).json({message:"User not found"});
            }
            const files = Array.isArray(req.files) ? Object.values(req.files) : [Object.values(req.files)[0]];
            const avatar = files[0];
            console.log(avatar);
            if(!avatar){
                return res.status(400).json({message: "No file uploaded"});
            }
            if(foundUser._profilePicture && fs.existsSync(foundUser._profilePicture)){
                fs.unlinkSync(foundUser._profilePicture);
            }
            const uploadPath = path.join(__dirname, '../uploads',`${foundUser._firstName}_${foundUser._lastName}`,v4()+path.extname(avatar.name));
            avatar.mv(uploadPath, async (err) => {
                if (err) {
                    return res.status(500).json({message: "Error uploading file"});
                }
                foundUser._profilePicture = uploadPath;
                await foundUser.save();
                res.status(200).json({message: "Avatar uploaded successfully", avatarUrl: foundUser._profilePicture});
            });
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
})
userRouter.get("/get-avatar",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const foundUser = await User.findById(req.user._id);
            if(!foundUser){
                return res.status(404).json({message:"User not found"});
            }else{
                const filePath = foundUser._profilePicture;
                if (filePath && fs.existsSync(filePath)) {
                    const fileReadStream = fs.createReadStream(filePath,{autoClose:true});
                    const mimeType = mimeTypes.lookup(filePath);
                    res.setHeader('Content-Type', mimeType||"application/octet-stream");
                    fileReadStream.pipe(res);
                } else {
                    res.status(404).json({message: "Avatar not found"});
                }
            }
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})
userRouter.put("/update",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_firstName,_lastName,_password,_phoneNumber,_address,_secondaryEmail} = req.body;
            const userByName = await User.findOne({_firstName,_lastName});
            if(userByName){
                return res.status(400).json({message:"User with this name exists"});
            }
            const userByEmail = await User.findOne({_secondaryEmail});
            if(userByEmail){
                return res.status(400).json({message:"User already exists"});
            }
            const user = await User.findByIdAndUpdate(req.user._id);
            if(_firstName) user._firstName = _firstName;
            if(_lastName) user._lastName = _lastName;
            if(_password) {
                user.markModified("_password")
                user._password = _password;
            }
            if(_phoneNumber) user._phoneNumber = _phoneNumber;
            if(_address) user._address = _address;
            if(_secondaryEmail) user._secondaryEmail = _secondaryEmail;
            await user.save();
            res.status(200).json(user);
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
})
userRouter.post("/toggle-follow/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_id} = req.params;
            const user = await User.findById(req.user._id);
            if(!user){
                return res.status(404).json({ message: "User not found" });
            }
            const foundUser = await User.findById(_id);
            if(!foundUser){
                return res.status(404).json({ message: "User not found" });
            }
            const isFollowed = user._following.some((id)=>id.toString()===_id.toString());
            if(isFollowed){
                user._following = user._following.filter((id)=>id.toString()!==_id.toString());
                res.status(200).json({followed: false,ok:true});
            }else{    
                user._following.push(_id);
                res.status(200).json({followed: true,ok:true});
            }
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
})
module.exports = userRouter;