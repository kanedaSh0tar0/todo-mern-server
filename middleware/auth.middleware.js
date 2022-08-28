const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') return next()

    const token = req.headers.authorization.split(' ')[1]

    try {

        if (!token) return res.status(401).json({ message: 'Auth error' })

        const decode = jwt.verify(token, config.get('secretKey'))
        req.userId = decode
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Auth error', token })
    }
}