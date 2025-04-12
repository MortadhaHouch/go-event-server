const {Router} = require("express")
const Event = require("../models/Event");
const eventRouter = Router();
const User = require("../models/User");
const checkUser = require("../middlewares/checkUser");
eventRouter.get("/:p",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {p} = req.params;
            const page = parseInt(p);
            const eventsCount = await Event.countDocuments({});
            const events = await Event.find({}).
                populate({path:"_organizer",select:"_firstName _lastName _email _phoneNumber _address"}).
                populate({path:"_participants",select:"_firstName _lastName _email _phoneNumber _address"}).
                skip(page && page > 1 ? (page-1)*10:0).
                limit(10);
            res.status(200).json({
                events:events.filter(e=>e!==null).map((e)=>{
                    return {
                        _id:e._id,
                        _title:e._title,
                        _description:e._description,
                        _startDate:e._startDate,
                        _endDate:e._endDate,
                        _location:e._location,
                        _organizer:e._organizer,
                        isOrganizer:e._organizer._id.toString() === req.user._id.toString(),
                        _participants:e._participants,
                        isMember:e._participants.some((p)=>p._id.toString() === req.user._id.toString()),
                        _price:e._price,
                        _bannerImage:e._bannerImage,
                        _availableSeats:e._availableSeats,
                        _isTicketed:e._isTicketed,
                        _startTime:e._startTime,
                        _endTime:e._endTime,
                        _duration:e._duration,
                        _category:e._category,
                        _status:e._status,
                        _participants:e._participants
                    }
                }),
                page:page || 1,
                total: eventsCount
            });
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching events" });
    }
})
eventRouter.get("/by-id/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const event = await Event.findById(req.params._id).populate({path:"_organizer",select:"_firstName _lastName _email _phoneNumber _address _id"}).populate({path:"_participants",select:"_firstName _lastName _email _phoneNumber _address _id"});
            if(event){
                res.status(200).json({
                    _id:event._id,
                    _title:event._title,
                    _description:event._description,
                    _startDate:event._startDate,
                    _endDate:event._endDate,
                    _location:event._location,
                    _organizer:event._organizer,
                    isOrganizer:event._organizer._id.toString() === req.user._id.toString(),
                    _participants:event._participants,
                    isMember:event._participants.some((p)=>p._id.toString() === req.user._id.toString()),
                    _price:event._price,
                    _bannerImage:event._bannerImage,
                    _availableSeats:event._availableSeats,
                    _isTicketed:event._isTicketed,
                    _startTime:event._startTime,
                    _endTime:event._endTime,
                    _duration:event._duration,
                    _category:event._category,
                    _status:event._status
                });
            }else{
                res.status(404).json({ message: "Event not found" });
            }
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching event" });
    }
})
eventRouter.post("/create",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_title,_description,_startDate,_endDate,_location,_price,_bannerImage,_availableSeats,_isTicketed,_startTime,_endTime,_duration,_category,_status} = req.body;
            if(!_title || !_description || !_startDate || !_endDate || !_location || !_price || !_bannerImage || !_availableSeats || !_isTicketed || !_startTime || !_endTime || !_duration || !_category || !_status){
                return res.status(400).json({ message: "Missing required fields" });
            }
            if(_startDate >= _endDate){
                return res.status(400).json({ message: "Start date must be before end date" });
            }
            if(_startTime >= _endTime){
                return res.status(400).json({ message: "Start time must be before end time" });
            }
            if(_availableSeats < 1){
                return res.status(400).json({ message: "Available seats must be at least 1" });
            }
            if(!_duration){
                return res.status(400).json({ message: "Duration is required" });
            }
            const savedEvent = await Event.create({
                _title,
                _description,
                _startDate,
                _endDate,
                _location,
                _organizer: req.user._id,
                _price,
                _bannerImage,
                _availableSeats,
                _isTicketed,
                _startTime,
                _endTime,
                _duration,
                _category,
                _status
            });
            res.status(201).json(savedEvent);
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating event" });
    }
})
eventRouter.put("/update/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_id} = req.params;
            const event = await Event.findById(_id);
            if(!event){
                return res.status(404).json({ message: "Event not found" });
            }
            if(event._organizer.toString() !== req.user._id.toString()){
                return res.status(403).json({ message: "You are not authorized to update this event" });
            }

            const {_title,_description,_startDate,_endDate,_location,_price,_bannerImage,_availableSeats,_isTicketed,_startTime,_endTime,_duration,_category,_status} = req.body;
            if(!_title || !_description || !_startDate || !_endDate || !_location || !_price || !_bannerImage || !_availableSeats || !_isTicketed || !_startTime || !_endTime || !_duration || !_category || !_status){
                return res.status(400).json({ message: "Missing required fields" });
            }
            if(_startDate >= _endDate){
                return res.status(400).json({ message: "Start date must be before end date" });
            }
            if(_startTime >= _endTime){
                return res.status(400).json({ message: "Start time must be before end time" });
            }
            if(_availableSeats < 1){
                return res.status(400).json({ message: "Available seats must be at least 1" });
            }
            if(!_duration){
                return res.status(400).json({ message: "Duration is required" });
            }
            
            const updatedEvent = await Event.findByIdAndUpdate(_id, {
                _title,
                _description,
                _startDate,
                _endDate,
                _location,
                _price,
                _bannerImage,
                _availableSeats,
                _isTicketed,
                _startTime,
                _endTime,
                _duration,
                _category,
                _status
            }, { new: true });
            res.status(200).json(updatedEvent);
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating event" });
    }
})
eventRouter.delete("/delete/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_id} = req.params;
            const event = await Event.findById(_id);
            if(!event){
                return res.status(404).json({ message: "Event not found" });
            }
            if(event._organizer.toString() !== req.user._id.toString()){
                return res.status(403).json({ message: "You are not authorized to delete this event" });
            }
            await Event.findByIdAndDelete(_id);
            res.status(200).json({ message: "Event deleted successfully" });
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting event" });
    }
})

module.exports = eventRouter