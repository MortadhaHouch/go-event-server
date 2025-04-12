const {Schema, model} = require("mongoose");
const requestSchema = new Schema({
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
})
module.exports = model("Request", requestSchema);