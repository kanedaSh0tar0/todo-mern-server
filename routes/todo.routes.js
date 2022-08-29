const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const Todo = require('../models/Todo')
const Folder = require('../models/Folder')

const router = new Router()

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { folder, title, text, date, files } = req.body
        const todo = new Todo({ owner: req.userId.id, title, text, date, files })

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
        return res.status(400).json({ message: "Can't add todo", err })
    }
})

router.get('/get', authMiddleware, async (req, res) => {
    try {
        const folder = req.query.folder
        let todos = {}

        if (!folder) {
            todos = await Todo.find({ owner: req.userId.id })
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
})

router.delete('/delete', authMiddleware, async (req, res) => {
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
})

router.patch('/edit', authMiddleware, async (req, res) => {
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
})

router.patch('/folder', authMiddleware, async (req, res) => {
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
})

router.patch('/editFolder', authMiddleware, async (req, res) => {
    try {
        const { name, color, id } = req.body

        const folder = await Folder.findOne({ _id: id })
        folder.name = name
        folder.color = color

        console.log(name)
        console.log(color)
        console.log(id)
        console.log(folder)
        await folder.save()
        console.log(folder)


        return res.json({ message: 'Folder edited', folder })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Can't edit todo" })
    }
})

router.post('/folder', authMiddleware, async (req, res) => {
    try {
        const { name, color } = req.body
        const newFolder = new Folder({ name, color, owner: req.userId.id })
        newFolder.save()
        return res.json({ message: 'Folder is created', newFolder })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Can't create folders" })
    }
})

router.get('/folder', authMiddleware, async (req, res) => {
    try {
        const allFolders = await Folder.find({ owner: req.userId.id })

        if (!allFolders) {
            return res.status(404).json({ message: 'Todos not found' })
        }

        return res.json(allFolders)
    } catch (err) {
        res.status(500).json({ message: "Can't get folders" })
    }
})

router.delete('/folder', authMiddleware, async (req, res) => {
    try {
        const { folderId } = req.body
        const removedFolder = await Folder.findOne({ _id: folderId })
        const removedTodos = await Todo.find({ folder: folderId })

        if (!removedFolder) {
            return res.status(404).json({ message: 'Folder not found' })
        }

        await removedTodos.forEach(todo => {
            todo.remove()
        })
        await removedFolder.remove()

        return res.json({ message: `Folder ${removedFolder.name} is removed`, removedFolder })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Can't delete folder" })
    }
})


module.exports = router