const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const Todo = require('../models/Todo')
const Folder = require('../models/Folder')

const router = new Router()

router.get('/get', authMiddleware, async (req, res) => {
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

router.post('/create', authMiddleware, async (req, res) => {
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

router.delete('/delete', authMiddleware, async (req, res) => {
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

router.patch('/edit', authMiddleware, async (req, res) => {
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

module.exports = router