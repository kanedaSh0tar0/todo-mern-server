const { model, Schema, ObjectId } = require('mongoose')

const Folder = new Schema({
    name: { type: String, required: false },
    color: { type: String },
    owner: { type: ObjectId, ref: 'User', required: true },
    childs: [{ type: ObjectId, ref: 'Todo' }]
})

module.exports = model('Folder', Folder)