const config = require('config')

function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.get('clientUrl'))
    res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, PATCH, POST, DELETE")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept")
    res.header("Access-Control-Allow-Credentials", true)
    next()
}

module.exports = cors