const {Router} = require("express")
const User = require("../models/User");
const checkUser = require("../middlewares/checkUser");
const Notification = require("../models/Notification");
const notificationRouter = Router()
notificationRouter.get("/:p",checkUser,async (req,res)=>{
    try {
        const {_id} = req.user;
        const {p} = req.params;
        const page = parseInt(p) || 1;
        const limit = 10; // Number of notifications per page
        const notifications = await Notification.find({$or:[{_toCommunity:{ $in: [_id] }},{_user:req.user._id}]}).populate('_from', 'firstName lastName').populate('_event', 'title description date time location').sort({createdAt: -1}).limit(limit).skip((page - 1) * limit);
        res.status(200).json(notifications);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
})
module.exports = notificationRouter;