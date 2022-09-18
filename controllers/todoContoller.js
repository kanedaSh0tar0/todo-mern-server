const Todo = require('../models/Todo')
const Folder = require('../models/Folder')

class TodoController {
    async create(req, res) {
        try {
            const { folder, title, text, date } = req.body
            const todo = new Todo({ owner: req.userData.id, title, text, date })

            if (folder) {
                todo.folder = folder
                const folderTodo = await Folder.findOne({ _id: folder })
                folderTodo.childs.push(todo._id)
                await folderTodo.save()
            }

            await todo.save()
            return res.json({ message: 'Todo is added', todo })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Can't add todo", err })
        }
    }

    async get(req, res) {
        try {
            const folder = req.query.folder
            let todos = []

            if (!folder) {
                todos = await Todo.find({ owner: req.userData.id })
            } else {
                todos = await Todo.find({ folder })
            }

            if (!todos) {
                return res.status(404).json({ message: 'Todos not found' })
            }
            return res.json(todos)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "Can't get todos" })
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.body
            const remoteTodo = await Todo.findOne({ _id: id })
            const folder = await Folder.findOne({ _id: remoteTodo.folder })

            if (!remoteTodo) {
                return res.status(404).json({ message: 'Todos not found' })
            }

            if (folder) {
                folder.childs = folder.childs.filter(child => !child.equals(remoteTodo._id))
                await folder.save()
            }

            await remoteTodo.remove()

            return res.json({ message: `Todo ${remoteTodo.title} is removed`, remoteTodo })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "Can't delete todo" })
        }
    }

    async edit(req, res) {
        try {
            const editedTodo = req.body
            const currentTodo = await Todo.updateOne({ _id: editedTodo._id }, editedTodo)

            if (!currentTodo) {
                return res.status(404).json({ message: 'Todos not found' })
            }

            return res.json(editedTodo)
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Can't edit todo" })
        }
    }

    async moveAnotherFolder(req, res) {
        try {
            const { folderId, todoId } = req.body

            const todo = await Todo.findOne({ _id: todoId })
            const currentFolder = todo.folder
            todo.folder = folderId
            await todo.save()

            if (currentFolder) {
                const folderFrom = await Folder.findOne({ _id: currentFolder })
                folderFrom.childs.filter(child => child !== todoId)
                await folderFrom.save()
            }

            const folderIn = await Folder.findOne({ _id: folderId })
            folderIn.childs.push(todoId)
            await folderIn.save()

            return res.json(todo)

        } catch (err) {
            console.log(err)
            return res.status(400).json({ message: "Can't move todo" })
        }
    }
}

module.exports = new TodoController