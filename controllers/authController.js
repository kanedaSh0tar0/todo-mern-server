const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const TokenService = require('../services/tokenService')
const User = require('../models/User')

class AuthHelper {
    static requestUserData(user) {
        const userData = {
            id: user.id || user._id,
            email: user.email,
            name: user.name,
            surname: user.surname
        }

        return userData
    }

    static async updateRefreshToken(userData) {
        const tokens = TokenService.createToken(userData)
        await TokenService.saveToken(userData.id, tokens.refreshToken)

        return tokens
    }
}

class AuthController {
    async registration(req, res) {
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

            const tokens = await AuthHelper.updateRefreshToken(AuthHelper.requestUserData(newUser))

            res.cookie(
                'refreshToken',
                tokens.refreshToken,
                {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                }
            )
            return res.json({
                accessToken: tokens.accessToken,
                user: AuthHelper.requestUserData(newUser)
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'Server error' })
        }

    }

    async login(req, res) {
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

            const tokens = await AuthHelper.updateRefreshToken(AuthHelper.requestUserData(user))

            res.cookie(
                'refreshToken',
                tokens.refreshToken,
                {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                }
            )

            return res.json({
                accessToken: tokens.accessToken,
                user: AuthHelper.requestUserData(user)
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'Server error' })
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies
            await TokenService.removeToken(refreshToken)

            res.clearCookie('refreshToken')
            return res.status(200)
        } catch (err) {
            console.log(err)
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies

            if (!refreshToken) {
                return res.status(401).json({ message: 'Missing refresh token' })
            }

            const user = TokenService.validateRefreshToken(refreshToken)
            const dbToken = await TokenService.findToken(refreshToken)

            if (!user || !dbToken) {
                return res.status(401).json({ message: 'Invalid refresh token' })
            }

            const tokens = await AuthHelper.updateRefreshToken(AuthHelper.requestUserData(user))

            res.cookie(
                'refreshToken',
                tokens.refreshToken,
                {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                }
            )

            return res.json({
                accessToken: tokens.accessToken,
                user
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'Server error' })
        }

    }
}

module.exports = new AuthController
