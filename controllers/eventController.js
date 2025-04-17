const {Router} = require("express")
const Event = require("../models/Event");
const eventRouter = Router();
const User = require("../models/User");
const checkUser = require("../middlewares/checkUser");
const Request = require("../models/Request");
const Notification = require("../models/Notification");
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
eventRouter.get("/filter",async(req,res)=>{
    try {
        const {_title,_description,_startDate,_endDate,_location,_price,_availableSeats,_isTicketed,_startTime,_endTime,_duration,_category,_status} = req.query;
        const filterCriteria = {};
        if (_title) filterCriteria._title = new RegExp(_title, 'i');
        if (_description) filterCriteria._description = new RegExp(_description, 'i');
        if (_startDate) filterCriteria._startDate = { $gte: new Date(_startDate) };
        if (_endDate) filterCriteria._endDate = { $lte: new Date(_endDate) };
        if (_location) filterCriteria._location = new RegExp(_location, 'i');
        if (_price) filterCriteria._price = _price;
        if (_availableSeats) filterCriteria._availableSeats = { $gte: _availableSeats };
        if (_isTicketed) filterCriteria._isTicketed = _isTicketed;
        if (_startTime) filterCriteria._startTime = { $gte: new Date(_startTime) };
        if (_endTime) filterCriteria._endTime = { $lte: new Date(_endTime) };
        if (_duration) filterCriteria._duration = _duration;
        if (_category) filterCriteria._category = _category;
        if (_status) filterCriteria._status = _status;
        const events = await Event.find(filterCriteria);
        res.status(200).json(events);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching events" });
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
            await Notification.create({
                _event:_id,
                _user:req.user._id,
                _from:event._organizer,
                _toCommunity:event._participants,
                _message:"Event updated"
            })
            res.status(200).json(updatedEvent);
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating event" });
    }
})
eventRouter.post("/join/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_id} = req.params;
            const event = await Event.findById(_id);
            const user = await User.findById(req.user._id);
            if(!event){
                return res.status(404).json({ message: "Event not found" });
            }
            if(event._isTicketed){
                return res.status(400).json({ message: "Event is ticketed" });
            }
            if(event._availableSeats === 0){
                return res.status(400).json({ message: "Event is full" });
            }
            if(event._participants.some((p)=>p._id.toString() === req.user._id.toString())){
                return res.status(400).json({ message: "You are already a participant" });
            }
            if(event._organizer.toString() === req.user._id.toString()){
                return res.status(400).json({ message: "You are the organizer of this event" });
            }
            if(event._availableSeats < 1){
                return res.status(400).json({ message: "No available seats" });
            }
            if(user._isLocked){
                return res.status(400).json({ message: "Your account is locked" });
            }
            const reuqest = await Request.create({
                _event:_id,
                _user:req.user._id,
                _status:"PENDING"
            });
            await Notification.create({
                _event:_id,
                _user:event._organizer,
                _from:req.user._id,
                _message:"New request to join event"
            })
            await Notification.create({
                _event:_id,
                _user:req.user._id,
                _from:event._organizer,
                _message:"Request sent to join event"
            })
            res.status(200).json({ message: "Request sent successfully" });
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error joining event" });
    }
})
eventRouter.post("/toggle-accept/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const reuqest = await Request.findById(req.params._id);
            if(reuqest){
                const event = await Event.findById(reuqest._event);
                if(!event){
                    return res.status(404).json({ message: "Event not found" });
                }
                if(event._organizer.toString() !== req.user._id.toString()){
                    return res.status(403).json({ message: "You are not authorized to accept this request" });
                }
                if(reuqest._status !== "PENDING"){
                    return res.status(400).json({ message: "Request is not pending" });
                }
                const {accept} = req.body;
                if(accept){
                    if(!event._participants.some((p)=>p._id.toString() === reuqest._user.toString())){
                        event._participants.push(reuqest._user);
                        event._availableSeats > 1 ? event._availableSeats -= 1 : event._availableSeats = 1;
                        await event.save();
                        reuqest._status = "ACCEPTED";
                        await reuqest.save();
                        await Notification.create({
                            _event:event._id,
                            _user:req.user._id,
                            _from:event._organizer,
                            _message:`request to join the event ${event._title} accepted`
                        })
                        await Notification.create({
                            _event:event._id,
                            _user:reuqest._user,
                            _from:req.user._id,
                            _message:`user ${req.user._firstName} accepted your request to join the event ${event._title}`
                        })
                        res.status(200).json({ message: "Request accepted successfully" });
                    }else{
                        return res.status(400).json({ message: "User is already a participant" });
                    }
                }else{
                    reuqest._status = "REJECTED";
                    event._availableSeats += 1;
                    await event.save();
                    await reuqest.save();
                    res.status(200).json({ message: "Request rejected successfully" });
                }
            }else{
                return res.status(404).json({ message: "Request not found" });
            }
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error accepting request" });
    }
})
eventRouter.post("/toggle-participant/:_participantId/:_id",checkUser,async(req,res)=>{
    try {
        if(req.user){
            const {_id,_participantId} = req.params;
            const event = await Event.findById(_id);
            if(!event){
                return res.status(404).json({ message: "Event not found" });
            }
            if(event._organizer.toString() !== req.user._id.toString()){
                return res.status(403).json({ message: "You are not authorized to remove this participant" });
            }
            const participant = await User.findById(_participantId);
            if(!participant){
                return res.status(404).json({ message: "Participant not found" });
            }
            const {action} = req.body;
            const index = event._participants.findIndex((p)=>p.toString() === _participantId.toString());
            if(action){
                if(index === -1){
                    event._participants.push(participant);
                    await event.save();
                    await Notification.create({
                        _event:_id,
                        _user:req.user._id,
                        _from:event._organizer,
                        _message:`You have been added to the event ${event._title}`
                    })
                    await Notification.create({
                        _event:_id,
                        _user:participant._id,
                        _from:req.user._id,
                        _message:`user ${req.user._firstName} added you to the event ${event._title}`
                    })
                    res.status(200).json({ message: "Participant added successfully" });
                }else{
                    return res.status(400).json({ message: "Participant is already a participant" });
                }
            }else{
                if(index !== -1){
                    event._participants.splice(index, 1);
                    event._availableSeats += 1;
                    await event.save();
                    await Notification.create({
                        _event:_id,
                        _user:req.user._id,
                        _from:event._organizer,
                        _message:`You have been removed from the event ${event._title}`
                    })
                    await Notification.create({
                        _event:_id,
                        _user:participant._id,
                        _from:req.user._id,
                        _message:`user ${req.user._firstName} removed you from the event ${event._title}`
                    })
                    res.status(200).json({ message: "Participant removed successfully" });
                }else{
                    return res.status(400).json({ message: "Participant is not a participant" });
                }
            }
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error removing participant" });
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
            await Notification.deleteMany({_event:_id});
            await Request.deleteMany({_event:_id});
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