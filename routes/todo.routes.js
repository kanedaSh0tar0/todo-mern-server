const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const TodoController = require('../controllers/todoContoller')

const router = new Router()

router.post('/create', authMiddleware, TodoController.create)
router.get('/get', authMiddleware, TodoController.get)
router.delete('/delete', authMiddleware, TodoController.delete)
router.patch('/edit', authMiddleware, TodoController.edit)
router.patch('/folder', authMiddleware, TodoController.moveAnotherFolder)

module.exports = router