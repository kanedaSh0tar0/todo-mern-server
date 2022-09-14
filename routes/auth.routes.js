const Router = require('express')
const { body } = require('express-validator')
const router = Router()

const AuthController = require('../controllers/authController')

router.post('/registration',
    [
        body('email').isEmail().withMessage('Uncorrect email'),
        body('password').isLength({ min: 4, max: 12 }).withMessage('Password shorter than 4 or longer than 12'),
        body('name').notEmpty().withMessage('Field name should not be empty'),
        body('surname').notEmpty().withMessage('Field surname should not be empty')
    ],
    AuthController.registration
)
router.post('/login', AuthController.login)
router.get('/logout', AuthController.logout)
router.get('/refresh', AuthController.refresh)

module.exports = router