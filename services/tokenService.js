const jwt = require('jsonwebtoken')
const config = require('config')
const RefreshToken = require('../models/RefreshToken')

class TokenService {
    createToken(payload) {
        const accessToken = jwt.sign(payload, config.get('ACCESS_TOKEN_SECRET'), { expiresIn: '10s' })
        const refreshToken = jwt.sign(payload, config.get('REFRESH_TOKEN_SECRET'), { expiresIn: '7d' })

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const dbToken = await RefreshToken.findOne({ user: userId })

        if (dbToken) {
            dbToken.token = refreshToken
            await dbToken.save()
            return dbToken
        }

        const token = new RefreshToken({ user: userId, token: refreshToken })
        await token.save()
        return token
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, config.get('ACCESS_TOKEN_SECRET'))
            return userData
        } catch (err) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, config.get('REFRESH_TOKEN_SECRET'))
            return userData
        } catch (err) {
            return null
        }
    }

    async findToken(refreshToken) {
        const dbToken = await RefreshToken.findOne({ token: refreshToken })
        return dbToken
    }

    async removeToken(refreshToken) {
        const removedToken = await RefreshToken.deleteOne(refreshToken)
        return removedToken
    }
}


module.exports = new TokenService