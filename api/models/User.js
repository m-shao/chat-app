const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {type:String, unique:true},
    password: String,
    friends: [String],
    frequests: [String]
}, {timestamps: true})

const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel