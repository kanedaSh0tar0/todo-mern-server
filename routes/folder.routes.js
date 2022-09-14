const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const FolderController = require('../controllers/folderController')
const router = new Router()

router.get('/get', authMiddleware, FolderController.get)
router.post('/create', authMiddleware, FolderController.create)
router.delete('/delete', authMiddleware, FolderController.delete)
router.patch('/edit', authMiddleware, FolderController.edit)

module.exports = router