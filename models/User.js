const { Schema, model } = require('mongoose')

const User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    surname: String
})

module.exports = model('User', User)