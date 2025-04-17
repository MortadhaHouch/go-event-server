const { Router } = require("express");
const Admin = require("../models/Admin");
const adminController = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAdmin = require("../middlewares/checkAdmin");
const mimeTypes = require("mime-types");
const User = require("../models/User");
require("dotenv").config();
adminController.post("/login",checkAdmin,async (req,res)=>{
    try {
        const {email,password} = req.body;
        const admin = await Admin.findOne({email});
        if(!admin){
            return res.status(400).json({message:"Admin does not exist"});
        }else{
            const isPasswordMatch = await bcrypt.compare(password,admin._password);
            if(isPasswordMatch){
                const token = jwt.sign({_id:admin._id},process.env.JWT_SECRET);
                res.status(200).json({token});
            }else{
                return res.status(400).json({message:"Password does not match"});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
adminController.get("/profile",checkAdmin,async(req,res)=>{
    try {
        const {_id} = req.user;
        const admin = await Admin.findById(_id);
        if(admin){
            const [_follwers,_following] = await Promise.all([follwersResults,followingResults]);
            res.status(200).json({
                _firstName:admin._firstName,
                _lastName:admin._lastName,
                _email:admin._email,
                _phoneNumber:admin._phoneNumber,
                _address:admin._address,
                _profilePicture:admin._profilePicture
            });
        }else{
            res.status(404).json({message:"User not found"});
        }
    } catch (error) {
        console.log(error);
    }
})
adminController.post("/add-avatar",checkAdmin,async(req,res)=>{
    try {
        if(req.user){
            const foundUser = await Admin.findById(req.user._id);
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
adminController.get("/get-avatar",checkAdmin,async(req,res)=>{
    try {
        if(req.user){
            const foundUser = await Admin.findById(req.user._id);
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
adminController.put("/update",checkAdmin,async(req,res)=>{
    try {
        if(req.user){
            const {_firstName,_lastName,_password,_phoneNumber,_address,_secondaryEmail} = req.body;
            const userByName = await Admin.findOne({_firstName,_lastName});
            if(userByName){
                return res.status(400).json({message:"User with this name exists"});
            }
            const userByEmail = await Admin.findOne({_secondaryEmail});
            if(userByEmail){
                return res.status(400).json({message:"User already exists"});
            }
            const user = await Admin.findByIdAndUpdate(req.user._id);
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
adminController.post("/lock/:id",checkAdmin,async(req,res)=>{
    try {
        const {_id} = req.params;
        const admin = await Admin.findById(_id);
        if(admin){
            const user = await User.findById(_id);
            if(user){
                user._isLocked = !user._isLocked;
                await user.save();
                res.status(200).json(user);
            }else{
                return res.status(404).json({message:"User not found"});
            }
        }else{
            return res.status(404).json({message:"User not found"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
})
adminController.post("/logout",checkAdmin,async(req,res)=>{
    try {
        if(req.user){
            res.clearCookie("auth_token");
            res.status(200).json({message:"Logged out successfully"});
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})
module.exports = adminController;