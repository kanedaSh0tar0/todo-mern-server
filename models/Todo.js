const { model, Schema, ObjectId } = require('mongoose')

const Todo = new Schema({
    owner: { type: ObjectId, ref: 'User' },
    title: String,
    text: String,
    completed: Boolean,
    date: Date,
    files: [{ type: ObjectId, ref: 'File' }],
    folder: { type: ObjectId, ref: 'Todo' }
})

module.exports = model('Todo', Todo)