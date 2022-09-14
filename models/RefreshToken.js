const { model, Schema, ObjectId } = require('mongoose')

const RefreshToken = new Schema({
    token: String,
    user: { type: ObjectId, ref: 'User' }
})

module.exports = model('RefreshToken', RefreshToken)