const TokenService = require('../services/tokenService')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') return next()

    try {
        const authorizationHeader = req.headers.authorization
        if (!authorizationHeader) return res.status(401).json({ message: 'Missing access token' })

        const token = authorizationHeader.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'Invalid access token' })

        const userData = TokenService.validateAccessToken(token)
        if (!userData) return res.status(401).json({ message: 'Not valid access token' })

        req.userData = userData
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: 'Auth error', token })
    }
}