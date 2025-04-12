const {model,Schema} = require('mongoose');
const notificationSchema = new Schema({
    _event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    _from:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    _toCommunity:{
        type: [Schema.Types.ObjectId],
        ref: "User",
        required: false
    },
    _message: {
        type: String,
        required: true
    },
    _isRead: {
        type: Boolean,
        default: false
    },
},{
    timestamps: true
})
module.exports = model("Notification", notificationSchema);