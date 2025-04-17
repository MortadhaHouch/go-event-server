const {Schema, model} = require("mongoose");
const bcrypt = require("bcrypt");
const adminSchema = new Schema({
    _firstName:{
        type:String,
        required:true,
    },
    _lastName:{
        type:String,
        required:true,
    },
    _email:{
        type:String,
        required:true,
        unique:true,
        validate: {
            validator: function(v) {
                return /.+@.+\..+/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    _password:{
        type:String,
        required:true,
        minlength: 8,
    },
    _phoneNumber:{
        type:Number,
        required:true,
        unique:true,
        validate:{
            validator:function(v){
                return v.toString().length === 8;
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    _address:{
        type:String,
        required:true,
    },
    _interests:{
        type:[String],
        required:true,
    },
    _profilePicture:{
        type:String,
        required:false,
    },
    secondaryEmail:{
        type:String,
        required:false,
        validate: {
            validator: function(v) {
                return /.+@.+\..+/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    }
},{
    timestamps:true,
});
adminSchema.pre("save",async function(next){
    try {
        if(this.isModified("_password")||this.isNew){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this._password, salt);
            this._password = hashedPassword;
        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
})
module.exports = model("Admin",adminSchema);