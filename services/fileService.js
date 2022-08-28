const fs = require('fs')
const path = require('path')
// const File = require('../models/File')

class FileService {

    createDir(user) {
        const filePath = path.join(process.cwd(), 'files', user)

        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({ message: 'File was created' })
                } else {
                    return reject({ message: 'File already exist' })
                }
            } catch (err) {
                return reject({ message: 'File error' })
            }
        })
    }
}

module.exports = new FileService