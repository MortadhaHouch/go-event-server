const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
require("dotenv").config();
const { JWT_SECRET } = process.env;

const checkAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded._id);
        if (!admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = checkAdmin;