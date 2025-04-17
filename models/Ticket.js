const {model,Schema} = require("mongoose")
const ticketSchema = new Schema({
    _cardNumber: {
        type: Number,
        required: true
    },
    _expiry: {
        type: Date,
        required: true
    },
    _cvv:{
        type: Number,
        required: true
    },
    _cardHolder:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    _discount:{
        type:String,
        required:false,
        validate:{
            validator:function(v){
                return parseInt(v) > 0 && parseInt(v) < 100;
            },
            message: props => `${props.value} is not a valid discount code!`
        }
    }
},{timestamps: true})
module.exports = model("Ticket", ticketSchema)