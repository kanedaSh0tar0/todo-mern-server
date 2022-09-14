const Folder = require('../models/Folder')
const Todo = require('../models/Todo')

class FolderController {
    async get(req, res) {
        try {
            const allFolders = await Folder.find({ owner: req.userData.id })

            if (!allFolders) {
                return res.status(404).json({ message: 'Folders not found' })
            }

            return res.json(allFolders)
        } catch (err) {
            res.status(500).json({ message: "Can't get folders" })
        }
    }

    async create(req, res) {
        try {
            const { name, color } = req.body

            const newFolder = new Folder({ name, color, owner: req.userData.id })
            newFolder.save()

            return res.json({ message: 'Folder is created', newFolder })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Can't create folders" })
        }
    }

    async delete(req, res) {
        try {
            const { folderId } = req.body
            const removedFolder = await Folder.findOne({ _id: folderId })
            const removedTodos = await Todo.find({ folder: folderId })

            if (!removedFolder) {
                return res.status(404).json({ message: 'Folder not found' })
            }

            removedTodos.forEach(async todo => {
                await todo.remove()
            })
            await removedFolder.remove()

            return res.json({ message: `Folder ${removedFolder.name} is removed`, removedFolder })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "Can't delete folder" })
        }
    }

    async edit(req, res) {
        try {
            const { name, color, id } = req.body

            const folder = await Folder.findOne({ _id: id })
            folder.name = name
            folder.color = color
            await folder.save()

            return res.json({ message: 'Folder edited', folder })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ message: "Can't edit todo" })
        }
    }
}

module.exports = new FolderController