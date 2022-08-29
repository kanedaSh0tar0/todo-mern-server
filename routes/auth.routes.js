const Router = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const router = Router()
const authMiddleware = require('../middleware/auth.middleware')
const FileService = require('../services/fileService')

router.post('/registration',
    [
        body('email').isEmail().withMessage('Uncorrect email'),
        body('password').isLength({ min: 4, max: 12 }).withMessage('Password shorter than 4 or longer than 12'),
        body('name').notEmpty().withMessage('Field name should not be empty'),
        body('surname').notEmpty().withMessage('Field surname should not be empty')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json(errors)
            }

            const { email, password, name, surname } = req.body
            const sameUser = await User.findOne({ email })

            if (sameUser) {
                return res.status(400).json({ message: `User with email ${email} already exists` })
            }

            const hashPass = await bcrypt.hash(password, 8)
            const newUser = new User({ email, password: hashPass, name, surname })

            await newUser.save()
            await FileService.createDir(newUser.id)
            return res.json({ message: 'User created' })

        } catch (err) {
            console.log(err)
            res.send('Server error')
        }
    })

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' })
        }

        const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                avatar: user.avatar
            }
        })

    } catch (err) {
        console.log(err)
        res.send('Server error')
    }
})

router.get('/auth', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.userId })
        const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                avatar: user.avatar
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send('Server error')
    }
})

module.exports = router