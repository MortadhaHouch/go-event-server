const {model,Schema} = require('mongoose');
const eventSchema = new Schema({
    _title: { 
        type: String,
        required: true 
    },
    _description: { 
        type: String, 
        required: true 
    },
    _startDate: { 
        type: Date,
        required: true 
    },
    _endDate: { 
        type: Date, 
        required: true 
    },
    _location: { 
        type: String, 
        required: true 
    },
    _organizer: { 
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    _participants:{
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: true 
    },
    _price:{
        type: Number, 
        required: true 
    },
    _bannerImage: {
        type: String, 
        required: true
    },
    _availableSeats:{
        type: Number, 
        required: true,
        min: 1
    },
    _isTicketed:{
        type: Boolean, 
        default: false
    },
    _startTime: { 
        type: Date, 
        required: true 
    },
    _endTime: { 
        type: Date, 
        required: true 
    },
    _duration: { 
        type: Number, 
        required: true 
    },
    _category: { 
        type: String, 
        required: true 
    },
    _status: { 
        type: String, 
        enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED',"POSTPONED"],
        default: 'UPCOMING' 
    },
},{
    timestamps:true,
})
module.exports = model('Event',eventSchema);