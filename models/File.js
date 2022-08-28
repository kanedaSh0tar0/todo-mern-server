const { model, Schema, ObjectId } = require('mongoose')

const File = new Schema({
    name: { type: String, required: false },
    type: { type: String, required: false },
    size: { type: Number, default: 0 },
    path: { type: String, default: '' },
    owner: { type: ObjectId, ref: 'User' },
    todo: { type: ObjectId, ref: 'Todo' }
})

module.exports = model('File', File)