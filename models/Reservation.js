const {Schema, model} = require("mongoose");
const reservationSchema = new Schema({
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
    _status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING"
    },
    _date: {
        type: Date,
        required: true
    },
},{
    timestamps: true
})
module.exports = model("Reservation", reservationSchema)