const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const authRouter = require('./routes/auth.routes')
const todoRouter = require('./routes/todo.routes')
const folderRouter = require('./routes/folder.routes')
const app = express()
const cors = require('./middleware/cors.middleware')
const PORT = process.env.PORT || config.get('serverPort')

app.use(cors)
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/todo', todoRouter)
app.use('/api/folder', folderRouter)

const start = async () => {
    try {
        mongoose.connect(config.get('mongoUrl'))

        app.listen(PORT, () => {
            console.log(`Server started on PORT ${PORT}`);
        })
    } catch (err) {

    }
}

start()